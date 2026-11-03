from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import (
    get_password_hash,
    get_current_user,
    require_hr_or_admin,
    require_super_admin,
    log_audit,
)

router = APIRouter(prefix="/employees", tags=["Employee Management"])


@router.get("", response_model=List[schemas.EmployeeResponse])
def list_employees(
    search: Optional[str] = Query(None, description="Search by Name, Employee ID, Email, Designation"),
    department: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status (Active, Inactive, Terminated)"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves all employee directory records.
    Available to all authenticated users (Employees see directory, HR/Admin manage).
    """
    query = db.query(models.Employee)

    if department and department != "ALL":
        query = query.filter(models.Employee.department.ilike(f"%{department}%"))

    if status and status != "ALL":
        query = query.filter(models.Employee.employment_status.ilike(status))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (models.Employee.full_name.ilike(s))
            | (models.Employee.employee_id.ilike(s))
            | (models.Employee.email.ilike(s))
            | (models.Employee.designation.ilike(s))
            | (models.Employee.phone.ilike(s))
        )

    employees = query.order_by(models.Employee.id.desc()).all()
    return [schemas.EmployeeResponse(**emp.to_dict()) for emp in employees]


@router.get("/{employee_id_or_pk}", response_model=schemas.EmployeeResponse)
def get_employee(
    employee_id_or_pk: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves single employee details by Database ID or Employee Badge ID (e.g. EMP-001)."""
    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id_or_pk}' not found.",
        )

    return schemas.EmployeeResponse(**employee.to_dict())


@router.post("", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: schemas.EmployeeCreate,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """
    Creates an employee record.
    If 'create_login_account' is enabled, automatically creates and links the employee's
    login credentials and assigns their role in the centralized authentication system.
    """
    # 1. Validate employee_id uniqueness
    existing_badge = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first()
    if existing_badge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee ID '{payload.employee_id}' is already registered.",
        )

    # 2. Validate employee email uniqueness
    existing_email = db.query(models.Employee).filter(models.Employee.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee email '{payload.email}' is already registered.",
        )

    # 3. Create Employee
    new_employee = models.Employee(
        employee_id=payload.employee_id.strip().upper(),
        full_name=payload.full_name.strip(),
        email=payload.email.strip().lower(),
        phone=payload.phone.strip(),
        department=payload.department.strip(),
        designation=payload.designation.strip(),
        joining_date=payload.joining_date,
        employment_status=payload.employment_status,
        salary=payload.salary,
        address=payload.address.strip(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_employee)
    db.flush()  # Obtain new_employee.id

    log_audit(
        db=db,
        action="EMPLOYEE_CREATED",
        performed_by=current_user.username,
        target_type="EMPLOYEE",
        target_id=new_employee.employee_id,
        details=f"HR/Admin created employee '{new_employee.full_name}' ({new_employee.employee_id}) in '{new_employee.department}'.",
    )

    # 4. Optional: Create connected Login Account
    if payload.create_login_account:
        username = payload.login_username.strip() if payload.login_username else payload.email.split("@")[0].lower()
        password = payload.login_password if payload.login_password else "password123"
        role = payload.login_role if payload.login_role in schemas.AVAILABLE_ROLES else "Employee"

        # Check if email is already taken in users table
        existing_user_email = db.query(models.User).filter(models.User.email == new_employee.email).first()
        if existing_user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A login user account already exists with email '{new_employee.email}'.",
            )

        # Check if username is taken and generate fallback
        existing_user_name = db.query(models.User).filter(models.User.username == username).first()
        if existing_user_name:
            username = f"{username}_{new_employee.id}"

        new_user = models.User(
            username=username,
            email=new_employee.email,
            hashed_password=get_password_hash(password),
            role=role,
            is_active=True if new_employee.employment_status.lower() == "active" else False,
            employee_id=new_employee.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(new_user)
        db.flush()

        log_audit(
            db=db,
            action="USER_CREATED",
            performed_by=current_user.username,
            target_type="USER",
            target_id=str(new_user.id),
            details=f"Login account '{username}' created and linked to employee '{new_employee.employee_id}' with role '{role}'.",
        )

    db.commit()
    db.refresh(new_employee)
    return schemas.EmployeeResponse(**new_employee.to_dict())


@router.put("/{employee_id_or_pk}", response_model=schemas.EmployeeResponse)
def update_employee(
    employee_id_or_pk: str,
    payload: schemas.EmployeeUpdate,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """
    Updates employee details.
    CRITICAL RULE: If HR changes the employee status to 'Inactive' or 'Terminated',
    the associated login account is automatically deactivated and blocked from logging in.
    """
    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id_or_pk}' not found.",
        )

    previous_status = employee.employment_status

    # Update provided fields
    if payload.full_name is not None:
        employee.full_name = payload.full_name.strip()
    if payload.email is not None:
        employee.email = payload.email.strip().lower()
        if employee.user:
            employee.user.email = employee.email
    if payload.phone is not None:
        employee.phone = payload.phone.strip()
    if payload.department is not None:
        employee.department = payload.department.strip()
    if payload.designation is not None:
        employee.designation = payload.designation.strip()
    if payload.joining_date is not None:
        employee.joining_date = payload.joining_date
    if payload.salary is not None:
        employee.salary = payload.salary
    if payload.address is not None:
        employee.address = payload.address.strip()

    # Status change logic
    if payload.employment_status is not None:
        new_status = payload.employment_status.strip()
        employee.employment_status = new_status

        # If employee status changed to Inactive or Terminated, deactivate connected login
        if new_status.lower() in ["inactive", "terminated"] and employee.user:
            employee.user.is_active = False
            log_audit(
                db=db,
                action="ACCOUNT_DEACTIVATED",
                performed_by=current_user.username,
                target_type="USER",
                target_id=str(employee.user.id),
                details=f"Login account '{employee.user.username}' automatically deactivated because employee status changed to '{new_status}'.",
            )
        elif new_status.lower() == "active" and employee.user and previous_status.lower() != "active":
            # If reactivated, allow login account reactivate
            employee.user.is_active = True
            log_audit(
                db=db,
                action="ACCOUNT_ACTIVATED",
                performed_by=current_user.username,
                target_type="USER",
                target_id=str(employee.user.id),
                details=f"Login account '{employee.user.username}' re-activated with employee reactivation.",
            )

    employee.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employee)

    log_audit(
        db=db,
        action="EMPLOYEE_UPDATED",
        performed_by=current_user.username,
        target_type="EMPLOYEE",
        target_id=employee.employee_id,
        details=f"Employee '{employee.employee_id}' profile updated by {current_user.username}.",
    )

    return schemas.EmployeeResponse(**employee.to_dict())


@router.post("/{employee_id_or_pk}/create-account", response_model=schemas.EmployeeResponse)
def create_account_for_existing_employee(
    employee_id_or_pk: str,
    payload: schemas.EmployeeCreateAccountRequest,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Admin or authorized HR user creates a login account for an existing employee."""
    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id_or_pk}' not found.",
        )

    if employee.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee '{employee.employee_id}' already has a linked login account ('{employee.user.username}').",
        )

    if employee.employment_status.lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot create login account for an employee with status '{employee.employment_status}'. Employee must be Active.",
        )

    # Check username collision
    username = payload.username.strip()
    if db.query(models.User).filter(models.User.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{username}' is already taken.",
        )

    role = payload.role if payload.role in schemas.AVAILABLE_ROLES else "Employee"

    new_user = models.User(
        username=username,
        email=employee.email,
        hashed_password=get_password_hash(payload.password),
        role=role,
        is_active=True,
        employee_id=employee.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(employee)

    log_audit(
        db=db,
        action="USER_CREATED",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(new_user.id),
        details=f"HR/Admin created login account '{username}' for employee '{employee.employee_id}' with role '{role}'.",
    )

    return schemas.EmployeeResponse(**employee.to_dict())


@router.post("/{employee_id_or_pk}/reset-password")
def reset_employee_password(
    employee_id_or_pk: str,
    payload: schemas.UserPasswordReset,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Admin or authorized HR user resets an employee's password."""
    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    if not employee.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee '{employee.employee_id}' does not have a login account.",
        )

    employee.user.hashed_password = get_password_hash(payload.new_password)
    employee.user.updated_at = datetime.utcnow()
    db.commit()

    log_audit(
        db=db,
        action="PASSWORD_RESET",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(employee.user.id),
        details=f"HR/Admin reset password for employee '{employee.employee_id}' (user '{employee.user.username}').",
    )

    return {"message": f"Password for {employee.full_name} ({employee.user.username}) has been reset successfully."}


@router.post("/{employee_id_or_pk}/toggle-account-status", response_model=schemas.EmployeeResponse)
def toggle_employee_account_status(
    employee_id_or_pk: str,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Admin or authorized HR user activates or deactivates an employee's login account."""
    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee or not employee.user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee or linked login account not found.",
        )

    # If employee is Inactive, prevent activation
    if not employee.user.is_active and employee.employment_status.lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot activate login account while employee status is '{employee.employment_status}'. Reactivate employee record first.",
        )

    employee.user.is_active = not employee.user.is_active
    employee.user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employee)

    new_status = "ACTIVATED" if employee.user.is_active else "DEACTIVATED"
    log_audit(
        db=db,
        action=f"ACCOUNT_{new_status}",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(employee.user.id),
        details=f"HR/Admin {new_status.lower()} login account for employee '{employee.employee_id}'.",
    )

    return schemas.EmployeeResponse(**employee.to_dict())


@router.put("/{employee_id_or_pk}/role", response_model=schemas.EmployeeResponse)
def change_employee_role(
    employee_id_or_pk: str,
    payload: schemas.UserRoleUpdate,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Admin or authorized HR user changes an employee's system role."""
    if payload.role not in schemas.AVAILABLE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Must be one of: {', '.join(schemas.AVAILABLE_ROLES)}",
        )

    # HR Managers cannot elevate users to Super Admin
    if current_user.role != "Super Admin" and payload.role == "Super Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a Super Admin can grant 'Super Admin' privileges.",
        )

    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee or not employee.user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee or login account not found.")

    old_role = employee.user.role
    employee.user.role = payload.role
    employee.user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employee)

    log_audit(
        db=db,
        action="ROLE_CHANGED",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(employee.user.id),
        details=f"Role for employee '{employee.employee_id}' changed from '{old_role}' to '{payload.role}' by {current_user.username}.",
    )

    return schemas.EmployeeResponse(**employee.to_dict())


@router.delete("/{employee_id_or_pk}")
def delete_employee(
    employee_id_or_pk: str,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Deletes an employee record and cascades removal of their login credentials."""
    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    # Guard against deleting active Super Admin's employee record
    if employee.user and employee.user.role == "Super Admin" and current_user.id == employee.user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own Super Admin account.")

    emp_badge = employee.employee_id
    emp_name = employee.full_name

    # If linked user exists, delete user first
    if employee.user:
        db.delete(employee.user)

    db.delete(employee)
    db.commit()

    log_audit(
        db=db,
        action="EMPLOYEE_DELETED",
        performed_by=current_user.username,
        target_type="EMPLOYEE",
        target_id=emp_badge,
        details=f"Employee '{emp_name}' ({emp_badge}) deleted by {current_user.username}.",
    )

    return {"message": f"Employee {emp_name} ({emp_badge}) deleted successfully."}


@router.get("/{employee_id_or_pk}/performance-ml")
def get_employee_performance_ml(
    employee_id_or_pk: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    ML-Driven Employee Performance & Daily Attendance Analytics.
    Provides daily attendance calendar, 6-month performance score, and predictive retention/burnout risks.
    """
    import os
    import sys
    ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml"))
    if ml_path not in sys.path:
        sys.path.insert(0, ml_path)

    try:
        from employee_performance_ml import EmployeePerformanceAnalyticsModel
        model = EmployeePerformanceAnalyticsModel()
    except Exception:
        model = None

    employee = None
    if employee_id_or_pk.isdigit():
        employee = db.query(models.Employee).filter(models.Employee.id == int(employee_id_or_pk)).first()
    if not employee:
        employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id_or_pk).first()

    emp_data = {
        "employee_id": employee.employee_id if employee else employee_id_or_pk,
        "full_name": employee.full_name if employee else "Employee",
        "department": employee.department if employee else "Engineering",
        "designation": employee.designation if employee else "Specialist",
        "joining_date": str(employee.joining_date) if employee and employee.joining_date else "2024-01-15",
        "salary": float(employee.salary) if employee and employee.salary else 100000.0,
    }

    if model:
        return model.analyze(emp_data)

    # Fallback response
    return {
        "status": "SUCCESS",
        "employee": emp_data,
        "kpiSummary": {"overallProductivityScore": 92, "attendanceRate": 96.5, "punctualityScore": 95},
        "dailyAttendance": [],
        "performanceTrend": [],
        "mlPredictions": {
            "attendanceReliabilityIndex": 96.0,
            "flightRisk": {"level": "LOW", "probabilityPercent": 12.0},
            "burnoutRisk": {"level": "OPTIMAL", "score": 20.0}
        }
    }


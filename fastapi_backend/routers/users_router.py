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
    require_super_admin,
    require_hr_or_admin,
    log_audit,
)

router = APIRouter(prefix="/users", tags=["Authentication & User Management"])


@router.get("", response_model=List[schemas.UserResponse])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by username, email, or employee name"),
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """
    Lists system accounts and their linked employee records.
    Accessible to Super Admin and HR Managers.
    """
    query = db.query(models.User)

    if role and role != "ALL":
        query = query.filter(models.User.role == role)

    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (models.User.username.ilike(s))
            | (models.User.email.ilike(s))
        )

    users = query.order_by(models.User.id.asc()).all()
    return [schemas.UserResponse(**u.to_dict()) for u in users]


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Retrieves a single user account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")
    return schemas.UserResponse(**user.to_dict())


@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: schemas.UserCreate,
    current_user: models.User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """Super Admin creates an independent user or associates an account to an existing employee."""
    # Check duplicate username
    if db.query(models.User).filter(models.User.username.ilike(payload.username.strip())).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' is already in use.",
        )

    # Check duplicate email
    if db.query(models.User).filter(models.User.email.ilike(payload.email.strip())).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' is already in use.",
        )

    # Optional employee association
    emp_fk_id = None
    if payload.employee_badge_id:
        emp = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_badge_id.strip()).first()
        if not emp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{payload.employee_badge_id}' not found.",
            )
        if emp.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee '{emp.employee_id}' is already linked to user account '{emp.user.username}'.",
            )
        emp_fk_id = emp.id

    role = payload.role if payload.role in schemas.AVAILABLE_ROLES else "Employee"

    new_user = models.User(
        username=payload.username.strip(),
        email=payload.email.strip().lower(),
        hashed_password=get_password_hash(payload.password),
        role=role,
        is_active=True,
        employee_id=emp_fk_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_audit(
        db=db,
        action="USER_CREATED",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(new_user.id),
        details=f"Super Admin created user '{new_user.username}' with role '{role}'.",
    )

    return schemas.UserResponse(**new_user.to_dict())


@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Updates user information."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    # Guard: only Super Admin can edit Super Admin accounts
    if user.role == "Super Admin" and current_user.role != "Super Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only a Super Admin can modify Super Admin accounts.")

    if payload.email is not None:
        user.email = payload.email.strip().lower()

    if payload.role is not None:
        if payload.role not in schemas.AVAILABLE_ROLES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role specified.")
        if payload.role == "Super Admin" and current_user.role != "Super Admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can assign Super Admin role.")
        user.role = payload.role

    if payload.is_active is not None:
        user.is_active = payload.is_active

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    log_audit(
        db=db,
        action="USER_UPDATED",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(user.id),
        details=f"User '{user.username}' updated by {current_user.username}.",
    )

    return schemas.UserResponse(**user.to_dict())


@router.put("/{user_id}/role", response_model=schemas.UserResponse)
def change_user_role(
    user_id: int,
    payload: schemas.UserRoleUpdate,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Assigns or updates a user's role from the 8 available roles."""
    if payload.role not in schemas.AVAILABLE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{payload.role}' is invalid. Allowed: {', '.join(schemas.AVAILABLE_ROLES)}",
        )

    if payload.role == "Super Admin" and current_user.role != "Super Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only a Super Admin can grant Super Admin role.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user.role == "Super Admin" and current_user.role != "Super Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot alter role of a Super Admin.")

    old_role = user.role
    user.role = payload.role
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    log_audit(
        db=db,
        action="ROLE_CHANGED",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(user.id),
        details=f"User '{user.username}' role changed from '{old_role}' to '{payload.role}' by {current_user.username}.",
    )

    return schemas.UserResponse(**user.to_dict())


@router.post("/{user_id}/toggle-status", response_model=schemas.UserResponse)
def toggle_user_active_status(
    user_id: int,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Activates or deactivates a user account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate your own active session account.")

    if user.role == "Super Admin" and current_user.role != "Super Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot deactivate a Super Admin account.")

    # If linked employee is Inactive, prevent activation
    if not user.is_active and user.employee and user.employee.employment_status.lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot activate user '{user.username}': Linked employee status is '{user.employee.employment_status}'. Reactivate employee record first.",
        )

    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    action_label = "ACTIVATED" if user.is_active else "DEACTIVATED"
    log_audit(
        db=db,
        action=f"ACCOUNT_{action_label}",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(user.id),
        details=f"User account '{user.username}' was {action_label.lower()} by {current_user.username}.",
    )

    return schemas.UserResponse(**user.to_dict())


@router.post("/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    payload: schemas.UserPasswordReset,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """Admin or authorized HR resets a user's password."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user.role == "Super Admin" and current_user.role != "Super Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only Super Admin can reset another Super Admin's password.")

    user.hashed_password = get_password_hash(payload.new_password)
    user.updated_at = datetime.utcnow()
    db.commit()

    log_audit(
        db=db,
        action="PASSWORD_RESET",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(user.id),
        details=f"Password for user '{user.username}' was reset by {current_user.username}.",
    )

    return {"message": f"Password for user '{user.username}' has been reset successfully."}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """Super Admin deletes a user account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own Super Admin account.")

    username = user.username
    db.delete(user)
    db.commit()

    log_audit(
        db=db,
        action="USER_DELETED",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(user_id),
        details=f"User '{username}' was permanently deleted by Super Admin {current_user.username}.",
    )

    return {"message": f"User account '{username}' deleted successfully."}

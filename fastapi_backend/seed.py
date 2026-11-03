from datetime import datetime
from sqlalchemy.orm import Session
import models
from security import get_password_hash, log_audit

DEFAULT_ENTERPRISE_ACCOUNTS = [
    {
        "role": "Super Admin",
        "username": "admin",
        "email": "admin@auratech.it",
        "password": "password123",
        "employee_id": "EMP-001",
        "full_name": "System Administrator",
        "phone": "+880 1700-000001",
        "department": "Executive & Governance",
        "designation": "Chief Technology Officer / Super Admin",
        "joining_date": "2024-01-01",
        "salary": 250000.0,
        "address": "Silicon Tower, Gulshan-2, Dhaka",
    },
    {
        "role": "HR Manager",
        "username": "hr",
        "email": "hr@auratech.it",
        "password": "password123",
        "employee_id": "EMP-002",
        "full_name": "Fatima Rahman",
        "phone": "+880 1700-000002",
        "department": "People & Culture",
        "designation": "Head of Human Resources & People",
        "joining_date": "2024-02-15",
        "salary": 150000.0,
        "address": "Banani DOHS, Dhaka",
    },
    {
        "role": "Sales Manager",
        "username": "sales",
        "email": "sales@auratech.it",
        "password": "password123",
        "employee_id": "EMP-003",
        "full_name": "Tanvir Ahmed",
        "phone": "+880 1700-000003",
        "department": "Client Accounts & Growth",
        "designation": "Enterprise Sales & Accounts Director",
        "joining_date": "2024-03-01",
        "salary": 160000.0,
        "address": "Uttara Sector 4, Dhaka",
    },
    {
        "role": "Project Manager",
        "username": "pm",
        "email": "pm@auratech.it",
        "password": "password123",
        "employee_id": "EMP-004",
        "full_name": "Nusrat Jahan",
        "phone": "+880 1700-000004",
        "department": "Engineering Delivery",
        "designation": "Senior Project & Delivery Manager",
        "joining_date": "2024-03-15",
        "salary": 155000.0,
        "address": "Mirpur DOHS, Dhaka",
    },
    {
        "role": "Finance Manager",
        "username": "finance",
        "email": "finance@auratech.it",
        "password": "password123",
        "employee_id": "EMP-005",
        "full_name": "Rafiqul Islam",
        "phone": "+880 1700-000005",
        "department": "Finance & Compliance",
        "designation": "Chief Financial Officer & Comptroller",
        "joining_date": "2024-01-10",
        "salary": 175000.0,
        "address": "Dhanmondi Road 27, Dhaka",
    },
    {
        "role": "Procurement Manager",
        "username": "procurement",
        "email": "procurement@auratech.it",
        "password": "password123",
        "employee_id": "EMP-006",
        "full_name": "Kamal Hossain",
        "phone": "+880 1700-000006",
        "department": "Supply Chain & Assets",
        "designation": "Procurement & Asset Inventory Manager",
        "joining_date": "2024-04-01",
        "salary": 140000.0,
        "address": "Bashundhara R/A, Block C, Dhaka",
    },
    {
        "role": "Support Staff",
        "username": "support",
        "email": "support@auratech.it",
        "password": "password123",
        "employee_id": "EMP-007",
        "full_name": "Ayesha Siddiqua",
        "phone": "+880 1700-000007",
        "department": "Tier-2 IT Help Desk",
        "designation": "Tier-2 IT Support Lead Specialist",
        "joining_date": "2024-05-01",
        "salary": 95000.0,
        "address": "Mohakhali Wireless, Dhaka",
    },
    {
        "role": "Employee",
        "username": "employee",
        "email": "employee@auratech.it",
        "password": "password123",
        "employee_id": "EMP-008",
        "full_name": "Mahmud Hasan",
        "phone": "+880 1700-000008",
        "department": "General Operations",
        "designation": "Datacenter Systems Engineer",
        "joining_date": "2024-06-01",
        "salary": 85000.0,
        "address": "Niketan, Gulshan-1, Dhaka",
    },
]


def seed_database(db: Session):
    """Populates the database with initial enterprise role accounts and employee records."""
    default_hash = get_password_hash("password123")

    for acc in DEFAULT_ENTERPRISE_ACCOUNTS:
        # 1. Ensure employee record exists
        emp = db.query(models.Employee).filter(
            (models.Employee.employee_id == acc["employee_id"]) | (models.Employee.email == acc["email"])
        ).first()

        if not emp:
            emp = models.Employee(
                employee_id=acc["employee_id"],
                full_name=acc["full_name"],
                email=acc["email"],
                phone=acc["phone"],
                department=acc["department"],
                designation=acc["designation"],
                joining_date=acc["joining_date"],
                employment_status="Active",
                salary=acc["salary"],
                address=acc["address"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(emp)
            db.flush()

        # 2. Ensure user account exists
        user = db.query(models.User).filter(
            (models.User.username == acc["username"]) | (models.User.email == acc["email"])
        ).first()

        if not user:
            user = models.User(
                username=acc["username"],
                email=acc["email"],
                hashed_password=default_hash,
                role=acc["role"],
                is_active=True,
                employee_id=emp.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(user)
            db.flush()

            log_audit(
                db=db,
                action="SYSTEM_INIT",
                performed_by="SYSTEM",
                target_type="USER",
                target_id=str(user.id),
                details=f"System role user '{user.username}' ({user.role}) initialized.",
            )
        else:
            # Update role and link employee if not linked
            if not user.employee_id:
                user.employee_id = emp.id
            if user.role != acc["role"]:
                user.role = acc["role"]
            user.is_active = True

    db.commit()
    print("==> Database verified and seeded with all 8 enterprise roles.")

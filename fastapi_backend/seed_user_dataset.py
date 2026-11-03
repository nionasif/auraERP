import os
import sys
import json
from datetime import datetime

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
import models
from security import get_password_hash

def seed_custom_employees_and_users():
    db_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", "src", "data", "database.json")
    with open(db_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    employees_list = data.get("employees", [])
    print(f"Loaded {len(employees_list)} employees from database.json")

    db = SessionLocal()
    default_hash = get_password_hash("password123")

    try:
        inserted_emp_count = 0
        inserted_usr_count = 0

        for emp_data in employees_list:
            emp_id = emp_data["employee_id"]
            email = emp_data["email"]

            emp = db.query(models.Employee).filter(
                (models.Employee.employee_id == emp_id) | (models.Employee.email == email)
            ).first()

            if not emp:
                emp = models.Employee(
                    employee_id=emp_id,
                    full_name=emp_data["full_name"],
                    email=email,
                    phone=emp_data.get("phone", "+880-1700-000000"),
                    department=emp_data.get("department", "Engineering"),
                    designation=emp_data.get("designation", "Software Engineer"),
                    joining_date=emp_data.get("joinDate", "2024-01-15"),
                    employment_status=emp_data.get("employment_status", "Active"),
                    salary=float(emp_data.get("salary", 100000.0)),
                    address=emp_data.get("address", "Dhaka, Bangladesh"),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(emp)
                db.flush()
                inserted_emp_count += 1

            username = emp_data.get("account_username")
            if username:
                user = db.query(models.User).filter(
                    (models.User.username == username) | (models.User.email == email)
                ).first()

                if not user:
                    user = models.User(
                        username=username,
                        email=email,
                        hashed_password=default_hash,
                        role=emp_data.get("account_role", "Employee"),
                        is_active=emp_data.get("account_active", True),
                        employee_id=emp.id,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(user)
                    db.flush()
                    inserted_usr_count += 1
                else:
                    if not user.employee_id:
                        user.employee_id = emp.id
                    user.role = emp_data.get("account_role", user.role)
                    user.is_active = emp_data.get("account_active", user.is_active)

        db.commit()
        print(f"✅ Successfully seeded FastAPI SQLite database:")
        print(f"   - Total Employees in DB: {db.query(models.Employee).count()} (Newly added: {inserted_emp_count})")
        print(f"   - Total Users in DB: {db.query(models.User).count()} (Newly added: {inserted_usr_count})")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_custom_employees_and_users()

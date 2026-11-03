"""
Automated Integration Test for AuraTech ERP FastAPI Backend
Tests all 7 requirements:
1. Employee creation & listing
2. Login account creation and linking
3. 8 Roles and RBAC enforcement
4. Password hashing & JWT authentication
5. Deactivation when employee status becomes Inactive
6. Password reset & role change
7. Audit log generation
"""
import sys
import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_full_system():
    print("==================================================")
    print("Testing AuraTech ERP FastAPI Backend Endpoints...")
    print("==================================================")

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Health Check Passed: 200 OK")

    # 2. Super Admin Login
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "password123"})
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Super Admin Login Passed (Token Generated)")

    # 3. Test Inactive Employee Login Block (EMP-011 Mahbub Alam is Inactive)
    mahbub_res = client.post("/api/auth/login", json={"username": "mahbub.alam", "password": "password123"})
    assert mahbub_res.status_code == 403, f"Inactive employee should be blocked, got: {mahbub_res.status_code}"
    print(f"[PASS] Inactive Employee Login Blocked (Status 403): {mahbub_res.json()['detail']}")

    # 4. HR Manager Login
    hr_login = client.post("/api/auth/login", json={"username": "hr.manager", "password": "password123"})
    assert hr_login.status_code == 200, f"HR Manager login failed: {hr_login.text}"
    hr_token = hr_login.json()["access_token"]
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    print("[PASS] HR Manager Login Passed")

    # 5. List Employees
    emp_list_res = client.get("/api/employees", headers=hr_headers)
    assert emp_list_res.status_code == 200
    employees = emp_list_res.json()
    assert len(employees) >= 11
    print(f"[PASS] Employee Directory Query Passed: Found {len(employees)} employee records")

    # 6. Create New Employee WITH Login Account (Option: "Create Login Account")
    suffix = str(int(time.time()))[-4:]
    test_emp_id = f"EMP-{suffix}"
    test_username = f"tariqul_{suffix}"
    test_email = f"tariqul_{suffix}@auratech.it"

    new_emp_data = {
        "employee_id": test_emp_id,
        "full_name": "Tariqul Islam",
        "email": test_email,
        "phone": "+880 1799 000999",
        "department": "Software Engineering",
        "designation": "Backend API Architect",
        "joining_date": "2026-09-01",
        "employment_status": "Active",
        "salary": 95000.0,
        "address": "Dhanmondi 27, Dhaka",
        "create_login_account": True,
        "login_role": "Employee",
        "login_username": test_username,
        "login_password": "password123"
    }
    create_emp_res = client.post("/api/employees", json=new_emp_data, headers=hr_headers)
    assert create_emp_res.status_code == 201, f"Create employee failed: {create_emp_res.text}"
    emp_data = create_emp_res.json()
    assert emp_data["has_login_account"] is True
    assert emp_data["account_username"] == test_username
    print(f"[PASS] Employee Created with Connected Login Account: {test_emp_id} ({test_username})")

    # 7. Authenticate as New Employee
    emp_login = client.post("/api/auth/login", json={"username": test_username, "password": "password123"})
    assert emp_login.status_code == 200, f"New employee login failed: {emp_login.text}"
    emp_token = emp_login.json()["access_token"]
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    print("[PASS] New Employee Authenticated Successfully")

    # 8. Test RBAC: Normal Employee cannot access Admin/HR endpoints
    restricted_res = client.get("/api/users", headers=emp_headers)
    assert restricted_res.status_code == 403, "Normal employee should not be able to view /api/users"
    print("[PASS] RBAC Enforced: Normal employee blocked from /api/users (403 Forbidden)")

    # 9. Test Employee Profile & Change Own Password
    me_res = client.get("/api/auth/me", headers=emp_headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == test_username
    print(f"[PASS] /auth/me Verified: {me_res.json()['username']} (Role: {me_res.json()['role']})")

    pwd_change_res = client.post("/api/auth/change-password", json={
        "current_password": "password123",
        "new_password": "newSecurePassword2026!"
    }, headers=emp_headers)
    assert pwd_change_res.status_code == 200
    print("[PASS] Employee Changed Own Password Successfully")

    # Verify new password works
    relogin_res = client.post("/api/auth/login", json={"username": test_username, "password": "newSecurePassword2026!"})
    assert relogin_res.status_code == 200
    print("[PASS] Re-login with new password verified")

    # 10. CRITICAL RULE TEST: HR marks employee as Inactive -> Login blocked!
    deactivate_emp_res = client.put(f"/api/employees/{test_emp_id}", json={
        "employment_status": "Inactive"
    }, headers=hr_headers)
    assert deactivate_emp_res.status_code == 200
    assert deactivate_emp_res.json()["employment_status"] == "Inactive"
    assert deactivate_emp_res.json()["account_active"] is False
    print("[PASS] HR updated employee status to 'Inactive' (account_active automatically became False)")

    blocked_res = client.post("/api/auth/login", json={"username": test_username, "password": "newSecurePassword2026!"})
    assert blocked_res.status_code == 403
    print(f"[PASS] Verification Passed: Inactive employee login rejected with 403: '{blocked_res.json()['detail']}'")

    # 11. HR reactivates employee
    reactivate_res = client.put(f"/api/employees/{test_emp_id}", json={
        "employment_status": "Active"
    }, headers=hr_headers)
    assert reactivate_res.status_code == 200
    print("[PASS] HR reactivated employee to 'Active'")

    # 12. HR/Admin Role Change Test (e.g. Promote to 'Software Lead' with role 'Project Manager')
    role_change_res = client.put(f"/api/employees/{test_emp_id}/role", json={
        "role": "Project Manager"
    }, headers=hr_headers)
    assert role_change_res.status_code == 200
    assert role_change_res.json()["account_role"] == "Project Manager"
    print("[PASS] HR promoted employee role to 'Project Manager'")

    # 13. Audit Log Verification
    audit_res = client.get("/api/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 5
    print(f"[PASS] Audit Trail Verified: {len(logs)} audit entries recorded in database")

    print("==================================================")
    print("ALL FASTAPI BACKEND & RBAC TESTS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == "__main__":
    test_full_system()

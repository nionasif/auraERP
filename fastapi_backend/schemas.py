from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Valid Roles
AVAILABLE_ROLES = [
    "Super Admin",
    "HR Manager",
    "Sales Manager",
    "Project Manager",
    "Finance Manager",
    "Procurement Manager",
    "Support Staff",
    "Employee",
]

# ----------------- EMPLOYEE SCHEMAS -----------------

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., description="Unique employee badge ID, e.g. EMP-001")
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=30)
    department: str = Field(..., min_length=2, max_length=100)
    designation: str = Field(..., min_length=2, max_length=100)
    joining_date: str = Field(..., description="YYYY-MM-DD")
    employment_status: str = Field(default="Active", description="Active | Inactive | Terminated")
    salary: float = Field(default=0.0, ge=0)
    address: str = Field(default="")

class EmployeeCreate(EmployeeBase):
    # Option to create linked login account concurrently
    create_login_account: bool = False
    login_role: Optional[str] = "Employee"
    login_username: Optional[str] = None
    login_password: Optional[str] = None

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[str] = None
    employment_status: Optional[str] = None  # If set to 'Inactive' or 'Terminated', deactivates login
    salary: Optional[float] = None
    address: Optional[str] = None

class EmployeeCreateAccountRequest(BaseModel):
    username: str = Field(..., min_length=2)
    password: str = Field(..., min_length=1)
    role: str = Field(default="Employee")

class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    phone: str
    department: str
    designation: str
    joining_date: str
    employment_status: str
    salary: float
    address: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    has_login_account: bool = False
    account_role: Optional[str] = None
    account_active: bool = False
    account_username: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- USER SCHEMAS -----------------

class UserBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    role: str = Field(default="Employee")

class UserCreate(UserBase):
    password: str = Field(..., min_length=1)
    employee_badge_id: Optional[str] = None  # Link to an existing employee_id

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserRoleUpdate(BaseModel):
    role: str = Field(..., description="Target role from the 8 allowed roles")

class UserPasswordReset(BaseModel):
    new_password: str = Field(..., min_length=1)

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    department: Optional[str] = None
    employee_status: Optional[str] = None
    last_login: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- AUTH SCHEMAS -----------------

class LoginRequest(BaseModel):
    username: str = Field(..., description="Username or email address")
    password: str = Field(..., min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- AUDIT LOG SCHEMAS -----------------

class AuditLogResponse(BaseModel):
    id: int
    action: str
    performed_by: str
    target_type: str
    target_id: str
    details: str
    timestamp: Optional[str] = None

    class Config:
        from_attributes = True

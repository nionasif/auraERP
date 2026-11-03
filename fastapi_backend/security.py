import os
from datetime import datetime, timedelta
from typing import Optional, List
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
import models

# Security configurations
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "auratech-enterprise-erp-secret-key-production-grade-2026-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hashes a password with salt using bcrypt. Truncates to 72 bytes per bcrypt standard."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def log_audit(
    db: Session,
    action: str,
    performed_by: str,
    target_type: str,
    target_id: str,
    details: str,
):
    """Utility to persist an audit log entry in the relational database."""
    log_entry = models.AuditLog(
        action=action,
        performed_by=performed_by,
        target_type=target_type,
        target_id=str(target_id),
        details=details,
        timestamp=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """
    Decodes the JWT token and returns the authenticated User.
    Enforces active account check and linked employee employment status check.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        # Fallback query by email if sub was email
        user = db.query(models.User).filter(models.User.email == username).first()

    if user is None:
        raise credentials_exception

    # 1. Check if user login account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your login account has been deactivated. Please contact your System Administrator or HR.",
        )

    # 2. Check if linked employee is Active
    # CRITICAL REQUIREMENT: If HR changes employee status to Inactive/Terminated,
    # the associated login account must be denied access.
    if user.employee and user.employee.employment_status.lower() != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Employee status is '{user.employee.employment_status}'. Login access has been disabled by HR.",
        )

    return user


def require_roles(*allowed_roles: str):
    """Dependency factory to verify that the current user possesses one of the allowed roles."""
    async def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{current_user.role}' is not authorized for this operation. Allowed roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


# Commonly used role guards
require_super_admin = require_roles("Super Admin")
require_hr_or_admin = require_roles("Super Admin", "HR Manager")

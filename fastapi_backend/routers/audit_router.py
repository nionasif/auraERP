from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import get_current_user, require_hr_or_admin

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])


@router.get("", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action keyword"),
    target_type: Optional[str] = Query(None, description="Filter by target type (EMPLOYEE, USER, AUTH)"),
    search: Optional[str] = Query(None, description="Search details, actor, or target ID"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    """
    Returns audit trail records for compliance, tracking user creations,
    logins, employee status alterations, role changes, and password resets.
    """
    query = db.query(models.AuditLog)

    if action and action != "ALL":
        query = query.filter(models.AuditLog.action.ilike(f"%{action}%"))

    if target_type and target_type != "ALL":
        query = query.filter(models.AuditLog.target_type == target_type)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (models.AuditLog.details.ilike(s))
            | (models.AuditLog.performed_by.ilike(s))
            | (models.AuditLog.target_id.ilike(s))
        )

    logs = (
        query.order_by(models.AuditLog.timestamp.desc(), models.AuditLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [schemas.AuditLogResponse(**log.to_dict()) for log in logs]

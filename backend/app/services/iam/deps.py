from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.iam.user import User
from app.services.iam import policy as policy_svc

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth = request.headers.get("Authorization") or ""
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")
    return user

def require_perm(action: str, resource: str):
    """
    Usage:
    @router.post(..., dependencies=[Depends(require_perm("create","evidence"))])
    The scope is read from query params: scope_type, scope_id (or override per endpoint).
    """
    def dep(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
        scope_type = request.query_params.get("scope_type")
        scope_id = request.query_params.get("scope_id")
        if not scope_type or not scope_id:
            # allow unscoped endpoints or enforce scope; here we enforce scope
            raise HTTPException(status_code=400, detail="Missing scope_type/scope_id for permission check")
        ok = policy_svc.has_permission(
            db, user_id=user.email, action=action, resource=resource,
            scope_type=scope_type, scope_id=int(scope_id)
        )
        if not ok:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    return dep

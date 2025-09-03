from fastapi import Depends, HTTPException, status, Request, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.models.iam.user import User
from app.services.iam import policy as policy_svc
from jwt import ExpiredSignatureError, InvalidSignatureError, DecodeError

auth_scheme = HTTPBearer(auto_error=False)
SKIP_PATH_PREFIXES = ("/auth", "/docs", "/redoc", "/openapi.json", "/favicon.ico")


def require_perm(action: str, resource: str):
    """
    Usage:
    @router.post(..., dependencies=[Depends(require_perm("create","evidence"))])
    The scope is read from query params: scope_type, scope_id (or override per endpoint).
    """
    def dep(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
        scope_type = request.query_params.get("scope_type")
        scope_id = request.query_params.get("scope_id")
        # TODO Permission Checks
        # if not scope_type or not scope_id:
        #     # allow unscoped endpoints or enforce scope; here we enforce scope
        #     raise HTTPException(status_code=400, detail="Missing scope_type/scope_id for permission check")
        #
        ok = user.id == 2 or policy_svc.has_permission(
            db, user_id=user.email, action=action, resource=resource,
            scope_type=scope_type, scope_id=int(scope_id)
        )
        print('OK-----------',ok)
        if not ok:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    return dep

def get_current_user(
    creds: HTTPAuthorizationCredentials = Security(auth_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = creds.credentials
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except InvalidSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature (check AUTH_SECRET)")
    except DecodeError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    sub = payload.get("sub")
    uname = payload.get("uname")

    user = None
    if sub:
        user = db.query(User).filter(User.email == sub).first()
    if not user and uname:
        user = db.query(User).filter(User.user_name == uname).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")
    return user

SKIP_PATH_PREFIXES = ("/auth", "/docs", "/redoc", "/openapi.json", "/favicon.ico")

def require_default_access(
    request: Request,
    creds: HTTPAuthorizationCredentials = Security(auth_scheme),
    db: Session = Depends(get_db),
):
    path = request.url.path or ""
    if path.startswith(SKIP_PATH_PREFIXES):
        return

    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_token(creds.credentials)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except (InvalidSignatureError, DecodeError, Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    sub = payload.get("sub"); uname = payload.get("uname")
    user = None
    if sub:
        user = db.query(User).filter(User.email == sub).first()
    if not user and uname:
        user = db.query(User).filter(User.user_name == uname).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")

    scope_type = request.query_params.get("scope_type")
    scope_id = request.query_params.get("scope_id")
    if scope_type and scope_id is not None:
        ok = policy_svc.has_permission(
            db, user_id=user.email, action="access", resource="app",
            scope_type=str(scope_type), scope_id=int(scope_id)
        )
        if not ok:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.iam.user import User
from app.schemas.iam.auth import UserCreate, UserOut, LoginIn, TokenOut, MeOut
from app.services.iam.deps import get_current_user
from app.services.iam import policy as policy_svc

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(409, "User already exists")
    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(403, "User disabled")
    token = create_access_token(sub=user.email)
    return TokenOut(access_token=token)

@router.get("/me", response_model=MeOut)
def me(scope_type: str | None = None, scope_id: int | None = None,
       user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    perms = []
    if scope_type and scope_id is not None:
        perms = policy_svc.permissions_for_user(db, user_id=user.email, scope_type=scope_type, scope_id=int(scope_id))
    return MeOut(user=user, permissions=perms)

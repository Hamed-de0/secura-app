from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.iam.user import User
from app.models.users import Person
from app.schemas.iam.auth import UserCreate, UserOut, LoginIn, TokenOut, MeOut, PersonLiteOut
from app.services.iam.deps import get_current_user
from app.services.iam import policy as policy_svc

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "User with this email already exists")
    if db.query(User).filter(User.user_name == payload.user_name).first():
        raise HTTPException(409, "User with this user_name already exists")

    # Optional linking strategy:
    person_id = payload.person_id
    if person_id is None:
        # Try auto-match by email (common HR <-> IT alignment)
        p = db.query(Person).filter(Person.email == payload.email).first()
        if p:
            person_id = p.id

    user = User(
        email=payload.email,
        user_name=payload.user_name,
        name=payload.name,
        password_hash=hash_password(payload.password),
        is_active=True,
        person_id=person_id,
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    if payload.email:
        user = db.query(User).filter(User.email == payload.email).first()
    else:
        user = db.query(User).filter(User.user_name == payload.user_name).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(403, "User disabled")

    token = create_access_token(sub=user.email, extra={"uname": user.user_name})
    return TokenOut(access_token=token)

@router.get("/me", response_model=MeOut)
def me(scope_type: str | None = None, scope_id: int | None = None,
       user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    person = None
    if user.person_id:
        person = db.query(Person).get(user.person_id)
    elif user.email:
        # soft fallback: show directory card if email matches
        person = db.query(Person).filter(Person.email == user.email).first()

    perms = []
    if scope_type and scope_id is not None:
        perms = policy_svc.permissions_for_user(db, user_id=user.email, scope_type=scope_type, scope_id=int(scope_id))
    return MeOut(user=user, person=person, permissions=perms)

@router.post("/me/link_person", response_model=MeOut)
def link_person(person_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Person).get(person_id)
    if not p:
        raise HTTPException(404, "Person not found")
    user.person_id = p.id
    db.commit(); db.refresh(user)
    return MeOut(user=user, person=p, permissions=[])

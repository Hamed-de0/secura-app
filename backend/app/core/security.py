import os, bcrypt, jwt
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

JWT_SECRET = os.getenv("AUTH_SECRET", "dev-secret-change-me")
JWT_ALG = os.getenv("AUTH_ALGORITHM", "HS256")
JWT_EXPIRES_MIN = int(os.getenv("AUTH_EXPIRES_MINUTES", "60"))

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(sub: str, extra: Optional[Dict[str, Any]] = None, minutes: Optional[int] = None) -> str:
    now = datetime.utcnow()
    exp = now + timedelta(minutes=minutes or JWT_EXPIRES_MIN)
    payload = {"sub": sub, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
    if extra: payload.update(extra)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])

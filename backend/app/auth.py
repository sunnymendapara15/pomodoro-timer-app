from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expires_at = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=settings.access_token_expires_minutes))
    to_encode = {"exp": expires_at, "sub": subject}
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

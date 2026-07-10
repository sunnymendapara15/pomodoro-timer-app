from datetime import datetime
from typing import Optional

from pydantic import EmailStr
from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: EmailStr = Field(sa_column=Column(String, unique=True, index=True))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

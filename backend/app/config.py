from typing import List

from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    secret_key: str = Field("change-me-in-production", env="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expires_minutes: int = Field(60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    database_url: str = Field("sqlite:///./backend.db", env="DATABASE_URL")
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"], env="CORS_ORIGINS")

    @validator("cors_origins", pre=True)
    def _assemble_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

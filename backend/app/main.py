from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from .auth import create_access_token, get_password_hash, verify_password
from .config import settings
from .database import engine, init_db
from .models import User
from .schemas import AuthResponse, UserCreate, UserLogin, UserRead

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

app = FastAPI(title="Pomodoro Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def _get_user_by_email(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email)).first()


def _authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = _get_user_by_email(session, email)
    if user and verify_password(password, user.hashed_password):
        return user
    return None


def _create_token_response(user: User) -> AuthResponse:
    token = create_access_token(subject=user.email)
    return AuthResponse(access_token=token, user=UserRead.from_orm(user))


@app.post("/api/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_create: UserCreate):
    with Session(engine) as session:
        if _get_user_by_email(session, user_create.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered.")
        user = User(
            email=user_create.email,
            hashed_password=get_password_hash(user_create.password),
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return _create_token_response(user)


@app.post("/api/login", response_model=AuthResponse)
def login(user_login: UserLogin):
    with Session(engine) as session:
        user = _authenticate_user(session, user_login.email, user_login.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return _create_token_response(user)


def _get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    with Session(engine) as session:
        user = _get_user_by_email(session, email)
        if not user:
            raise credentials_exception
        return user


@app.get("/api/me", response_model=UserRead)
def read_self(current_user: User = Depends(_get_current_user)):
    return UserRead.from_orm(current_user)

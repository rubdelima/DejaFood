from datetime import timedelta
from fastapi import HTTPException, Response
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from src.config.database import User
from src.models.user_auth import UserCreate, UserLogin
from src.utils.auth import create_access_token
from src.config.environment import ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def check_if_user_exists(email: str, db: Session):
    return db.query(User).filter(User.email == email).first()


def create_user(user: UserCreate, db: Session):
    if check_if_user_exists(user.email, db):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def login_user(user: UserLogin, response: Response, db: Session):
    user_db = check_if_user_exists(user.email, db)
    if not user_db:
        raise HTTPException(status_code=400, detail="User not found")
    if not pwd_context.verify(user.password, user_db.password):
        raise HTTPException(status_code=400, detail="Invalid Credentials")
    
    access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    access_token = create_access_token(data={"sub": user_db.email}, expires_delta=access_token_expires)
    return {
        "access_token": access_token,
        "user": {
            "id": user_db.id,
            "email": user_db.email,
            "name": user_db.name
        }
    }
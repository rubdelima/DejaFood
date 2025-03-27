from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from src.dependencies import get_db
from src.models.user_auth import UserCreate, UserResponse, LoggedUserResponse, UserLogin
from src.controllers.auth import create_user as create_user_controller, login_user as login_user_controller

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user_controller(user, db)


@router.post("/login", response_model=LoggedUserResponse)
def login_user(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    return login_user_controller(user, response, db)
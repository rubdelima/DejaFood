from fastapi import APIRouter, Depends, UploadFile, File
from src.controllers.recipe import get_recipe
from src.config.database import User
from src.middlewares.auth import get_current_user
import logging

router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.post("/")
async def generate_recipe(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    print('opa')
    return await get_recipe(file)
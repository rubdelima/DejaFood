from fastapi import APIRouter, Depends, UploadFile, File
from src.controllers.recipe import get_recipe
from src.config.database import User
from src.middlewares.auth import get_current_user
import logging
from src.utils.ai.tools_model.schemas import RecieveResult
from typing import List

router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.post("/", response_model=List[RecieveResult])
async def generate_recipe(file: UploadFile = File(...)):
    # async def generate_recipe(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    return await get_recipe(file)
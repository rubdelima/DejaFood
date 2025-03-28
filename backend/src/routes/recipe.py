from fastapi import APIRouter, Depends, UploadFile, File
from src.controllers.recipe import get_recipe
from src.config.database import User
from src.middlewares.auth import get_current_user
import logging
from src.utils.ai.tools_model.schemas import RecieveResult
from typing import List
import json


router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.post("/generate", response_model=List[RecieveResult])
async def generate_recipe(file: UploadFile = File(...)):
    # async def generate_recipe(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    return await get_recipe(file)

@router.post("/search", response_model=List[RecieveResult])
async def search_recipe(file: UploadFile = File(...)):
    # async def generate_recipe(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    return await get_recipe(file, search=True)

@router.post("/simulate", response_model=List[RecieveResult])
async def simulate(file: UploadFile = File(...)):
    return await get_recipe(file, return_ingredients=True)


@router.get("/all", response_model=List[RecieveResult])
async def get_recipes():
    with open("./history.json") as f:
        history = json.load(f)
    
    return [RecieveResult(**h) for h in history]
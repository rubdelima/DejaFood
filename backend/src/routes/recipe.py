from fastapi import APIRouter, UploadFile, File
from src.controllers.recipe import get_recipe, get_recipe_from_ingredients
from src.utils.ai.tools_model.schemas import RecieveResult
from typing import List
import json

router = APIRouter(prefix="/recipes", tags=["Recipes"])

@router.post("/generate", response_model=List[RecieveResult])
async def generate_recipe(file: UploadFile = File(...)):
    """
    Generate recipes from an uploaded image.
    """
    return await get_recipe(file)

@router.post("/search", response_model=List[RecieveResult])
async def search_recipe(file: UploadFile = File(...)):
    """
    Search for recipes based on an uploaded image.
    """
    return await get_recipe(file, search=True)

@router.post("/simulate", response_model=List[RecieveResult])
async def simulate(file: UploadFile = File(...)):
    """
    Simulate the process by returning only the extracted ingredients.
    """
    return await get_recipe(file, return_ingredients=True)

@router.get("/all", response_model=List[RecieveResult])
async def get_recipes():
    """
    Retrieve all recipes from the history file.
    """
    try:
        with open("./history.json") as f:
            history = json.load(f)
        return [RecieveResult(**h) for h in history]
    except FileNotFoundError:
        return []

@router.post("/generate-from-ingredients", response_model=List[RecieveResult])
async def generate_from_ingredients(ingredients: List[str]):
    """
    Generate recipes directly from a list of ingredients.
    """
    return await get_recipe_from_ingredients(ingredients)
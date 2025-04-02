import json
from fastapi import HTTPException, UploadFile
from src.utils.ai.tools_model.model import ToolsModel
from src.utils.ai.clarifai import get_ingredients_from_image
from src.utils.file import save_temp_file, delete_temp_file
from src.utils.ai.tools_model.schemas import RecieveResult
from googletrans import Translator
import traceback

tools_model = ToolsModel(model_name="phi4-mini", model_type="ollama")
translator = Translator()

async def process_image(file: UploadFile) -> list[str]:
    """
    Process an image to extract ingredients.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="The uploaded file is not an image.")

    image_path = save_temp_file(file)
    try:
        ingredients = get_ingredients_from_image(image_path)
        ingredients_pt = []
        
        for ingredient in ingredients:
            ingredient_pt = (await translator.translate(ingredient, src='en', dest='pt')).text
            ingredients_pt.append(ingredient_pt)
        
        print("Extracted ingredients:", ingredients_pt)
        return ingredients_pt
    
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing the image: {str(e)}")

    finally:
        delete_temp_file(image_path)

async def generate_or_search_recipes(ingredients: list[str], search: bool = False) -> list[RecieveResult]:
    """
    Generate or search for recipes based on ingredients.
    """
    try:
        if search:
            recipes = tools_model.search_recipes(ingredients)
        else:
            recipes =  tools_model.get_recipes(ingredients)
        
        update_recipe_history(recipes)
        return recipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipes: {str(e)}")

def update_recipe_history(new_recipes: list[RecieveResult]):
    """
    Update the recipe history file with new recipes.
    """
    try:
        print("Atualizando Banco de Dados")
        with open("./history.json", "r") as f:
            history = json.load(f)
            print("Histórico Lido com Sucesso")
    except FileNotFoundError:
        history = []

    history.extend([r.model_dump() for r in new_recipes])
    with open("./history.json", "w") as f:
        json.dump(history, f, indent=4)
        print("Histórico Atualizado com Sucesso")

async def get_recipe(file: UploadFile, search: bool = False, return_ingredients: bool = False):
    """
    Main function to handle recipe generation or search from an image.
    """
    ingredients = await process_image(file)

    if return_ingredients:
        return [RecieveResult(ingredients=ingredients)]

    new_recipes = await generate_or_search_recipes(ingredients, search=search)
    update_recipe_history(new_recipes)
    return new_recipes

async def get_recipe_from_ingredients(ingredients: list[str]):
    """
    Generate recipes directly from a list of ingredients.
    """
    try:
        recipes = tools_model.generate_recipes_from_ingredients(ingredients)
        update_recipe_history(recipes)
        return recipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipes: {str(e)}")
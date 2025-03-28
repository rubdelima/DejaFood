import os
from fastapi import HTTPException, UploadFile
from src.utils.ai.tools_model.model import ToolsModel
from src.utils.ai.clarifai import get_ingredients_from_image
import json
from src.utils.ai.tools_model.schemas import RecieveResult

# tools_model = ToolsModel(model_name="gemini-2.0-flash", model_type="gemini")
tools_model = ToolsModel("phi4-mini", "ollama")

async def get_recipe(file: UploadFile, search:bool = False, return_ingredients:bool = False):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo enviado não é uma imagem.")

    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)

    image_path = os.path.join(temp_dir, file.filename)
    try:
        with open(image_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar a imagem: {str(e)}")

    try:
        ingredients = get_ingredients_from_image(image_path)
        print('ingredientes', ingredients)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar a imagem: {str(e)}")
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

    if return_ingredients:
        return [RecieveResult(ingredients=ingredients)]
    
    try:
        
        if search:
            new_recipes = tools_model.search_recipes(ingredients)
        else:
            new_recipes = tools_model.get_recipes(ingredients)
        
        with open("./history.json") as f:
            history = json.load(f)
            history.extend([r.model_dump() for r in new_recipes])
        with open("./history.json", "w") as f:
            json.dump(history, f, indent=4)
        
        return new_recipes
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar receitas: {str(e)}")
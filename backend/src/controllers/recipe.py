import os
from fastapi import HTTPException, UploadFile
from fastapi.responses import JSONResponse

from src.utils.ai.tools_model.model import ToolsModel
from src.utils.ai.clarifai import get_ingredients_from_image
import json

tools_model = ToolsModel(model_name="gemini-2.0-flash", model_type="gemini")

async def get_recipe(file: UploadFile):
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

    try:
        new_recipes = tools_model.find_recieves(ingredients)
        
        with open("./history.json") as f:
            history = json.load(f)
            history.extend([r.model_dump() for r in new_recipes])
        with open("./history.json", "w") as f:
            json.dump(history, f)
        
        return new_recipes
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar receitas: {str(e)}")
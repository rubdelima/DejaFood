from typing import List
from pydantic import BaseModel

class IngredientsRequest(BaseModel):
    ingredients: List[str]
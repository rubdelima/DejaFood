from pydantic import BaseModel
from typing import List, Optional
from typing_extensions import Annotated
import operator

class RecieveBase(BaseModel):
    images: List[str] =[]
    ingredients: List[str] = []
    steps: List[str] = []
    videos : List[str] = []
    
class RecieveResult(RecieveBase):
    title: Optional[str] = None
    url: Optional[str] = None

class ReportState(BaseModel):
    ingredients: List[str] = []
    recieves_names : List[str] = []
    recieves_results : Annotated[List[RecieveResult], operator.add]

class RecieveList(BaseModel):
    recieves: List[str] = []
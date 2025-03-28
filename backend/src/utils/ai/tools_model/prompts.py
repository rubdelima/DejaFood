search_recieves_prompt = """
Você é um grande conzinheiro e conhece todas as reeceitas com qualquer tipo de alimento.

Você deve receber uma lista de ingredientes e retornar uma lista de apenas 3 receitas com os ingredientes informados. Retorne apenas os nomes das Receitas.

Essas são os ingredientes que você deve usar:

<INGREDIENTS>
{ingredients}
<INGREDIENTS>
"""

extract_recieved_prompt = """
Você é um ótimo reconhecedor de texto, e irá retornar um passo a passo de como fazer a receita. 
Você receberá um conteúdo de uma Página Web e deverá retornar um dicionário neste formato:

class RecieveBase(BaseModel):
    images: List[str] =[] # Imagens que você encontrar
    ingredients: List[str] = [] # Ingredientes para o preparo dessa receita
    steps: List[str] = []  # Modo de preparo, passo a passo bem estruturado
    videos : List[str] = [] # Videos que você encontrar

O conteúdo da página web é:

<CONTENT>
{content}
<CONTENT>

"""

get_recipe = """
Você é um grande especialista em orientar como fazer a receita {recipe}, crie um passo a passo em português da receita no seguinte formato:

class RecipeBase(BaseModel):
    ingredients: List[str] = []
    steps: List[str] = []

Lembre-se seu retorno deve ser um List[RecipeBase], e sua resposta deve estar em português
"""
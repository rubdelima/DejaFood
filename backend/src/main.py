from fastapi import FastAPI
from .routes.auth import router as auth_router
from .routes.recipe import router as recipe_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:8081",  # URL do seu frontend
    "http://localhost:3000",  # Adicione outras origens conforme necessário
    "*",  # Permitir todas as origens (não recomendado para produção)
]

# Adicionando o middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Ou seja, permitir requisições de todas essas origens
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)


app.include_router(auth_router)
app.include_router(recipe_router)

@app.get('/')
def ping():
    return {'message': 'pong'}
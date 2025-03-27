from fastapi import FastAPI
from .routes.auth import router as auth_router
from .routes.recipe import router as recipe_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(recipe_router)

@app.get('/')
def ping():
    return {'message': 'pong'}
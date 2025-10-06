from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from . import api

app = FastAPI()

# Mount static files at /static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include all routes from api.py
app.include_router(api.router)


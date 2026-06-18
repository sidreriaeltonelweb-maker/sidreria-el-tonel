from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.reservations import router as reservations_router
from app.api.tables import router as tables_router
from app.api.users import router as users_router
from app.core.config import settings
from app.db.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_data()
    yield


app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0", lifespan=lifespan)
configured_origins = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]
origins = list(
    dict.fromkeys(
        configured_origins + ["https://sidreriaeltonelweb-maker.github.io"]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tables_router)
app.include_router(reservations_router)
app.include_router(dashboard_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {
        "restaurante": "Sidrería El Tonel",
        "estado": "online",
        "entorno": settings.ENVIRONMENT,
        "version": "1.2.0",
    }

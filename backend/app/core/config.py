from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sidrería El Tonel API"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./sidreria_el_tonel.db"
    SECRET_KEY: str = "cambia_esto_por_una_clave_larga_segura"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "https://sidreriaeltonelweb-maker.github.io"
    )

    class Config:
        env_file = ".env"


settings = Settings()

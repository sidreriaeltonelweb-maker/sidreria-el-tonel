from pydantic import BaseModel
from pydantic import field_validator


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, value: str) -> str:
        return value.strip().lower()

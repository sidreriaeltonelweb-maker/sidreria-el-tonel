from pydantic import BaseModel
from pydantic import field_validator


class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "empleado"

    @field_validator("nombre", "email", "password", "rol")
    @classmethod
    def validar_texto(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo es obligatorio")
        return value

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, value: str) -> str:
        value = value.lower()
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Email no válido")
        return value

    @field_validator("password")
    @classmethod
    def validar_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres")
        return value

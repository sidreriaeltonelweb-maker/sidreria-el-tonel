from pydantic import BaseModel


class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "empleado"

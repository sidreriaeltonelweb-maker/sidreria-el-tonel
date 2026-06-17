from pydantic import BaseModel


class TableCreate(BaseModel):
    nombre: str
    capacidad: int
    zona: str = "principal"


class TableUpdate(BaseModel):
    nombre: str | None = None
    capacidad: int | None = None
    zona: str | None = None
    activa: bool | None = None

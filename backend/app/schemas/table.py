from pydantic import BaseModel
from pydantic import field_validator


class TableCreate(BaseModel):
    nombre: str
    capacidad: int
    zona: str = "principal"

    @field_validator("nombre", "zona")
    @classmethod
    def validar_texto(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo es obligatorio")
        return value

    @field_validator("capacidad")
    @classmethod
    def validar_capacidad(cls, value: int) -> int:
        if value < 1:
            raise ValueError("La capacidad debe ser mayor que cero")
        return value


class TableUpdate(BaseModel):
    nombre: str | None = None
    capacidad: int | None = None
    zona: str | None = None
    activa: bool | None = None

    @field_validator("nombre", "zona")
    @classmethod
    def validar_texto_opcional(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Este campo es obligatorio")
        return value

    @field_validator("capacidad")
    @classmethod
    def validar_capacidad_opcional(cls, value: int | None) -> int | None:
        if value is not None and value < 1:
            raise ValueError("La capacidad debe ser mayor que cero")
        return value

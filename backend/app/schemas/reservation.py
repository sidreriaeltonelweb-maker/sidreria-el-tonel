from datetime import date, time
from pydantic import BaseModel


class ReservationCreate(BaseModel):
    cliente_nombre: str
    cliente_telefono: str
    personas: int
    fecha: date
    hora: time
    observaciones: str | None = None


class ReservationAssignTable(BaseModel):
    mesa_id: int

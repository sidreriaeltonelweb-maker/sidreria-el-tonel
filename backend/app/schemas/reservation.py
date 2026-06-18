from datetime import date, datetime, time, timedelta
from typing import Literal
from pydantic import BaseModel, field_validator, model_validator


class ReservationCreate(BaseModel):
    cliente_nombre: str
    cliente_telefono: str
    personas: int
    fecha: date
    hora: time
    hora_fin: time | None = None
    zona_preferida: Literal["interior", "exterior"] = "interior"
    observaciones: str | None = None

    @field_validator("cliente_nombre", "cliente_telefono")
    @classmethod
    def validar_texto_obligatorio(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo es obligatorio")
        return value

    @field_validator("personas")
    @classmethod
    def validar_personas(cls, value: int) -> int:
        if value < 1:
            raise ValueError("La reserva debe ser para al menos 1 persona")
        return value

    @field_validator("fecha")
    @classmethod
    def validar_fecha(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("No se pueden crear reservas en fechas pasadas")
        if value.weekday() == 2:
            raise ValueError("Los miércoles el restaurante está cerrado")
        return value

    @field_validator("hora")
    @classmethod
    def validar_hora(cls, value: time) -> time:
        if value < time(11, 30) or value > time(23, 0):
            raise ValueError("El horario de reservas es de 11:30 a 23:00")
        return value

    @model_validator(mode="after")
    def validar_intervalo(self):
        if self.hora_fin is None:
            fin_calculado = datetime.combine(date.today(), self.hora) + timedelta(hours=2)
            self.hora_fin = min(fin_calculado.time(), time(23, 0))
        if self.hora_fin <= self.hora:
            raise ValueError("La hora de fin debe ser posterior a la hora de inicio")
        if self.hora_fin > time(23, 0):
            raise ValueError("La reserva debe finalizar antes de las 23:00")
        return self


class ReservationAssignTable(BaseModel):
    mesa_id: int

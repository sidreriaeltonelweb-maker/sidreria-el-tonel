from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.table import Table
from app.models.reservation import Reservation

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/mesas")
def estado_mesas(db: Session = Depends(get_db)):
    mesas = db.query(Table).all()

    resultado = []

    for mesa in mesas:
        estado = "libre"

        reserva = (
            db.query(Reservation)
            .filter(
                Reservation.mesa_id == mesa.id,
                Reservation.estado.in_(["pendiente", "confirmada"])
            )
            .first()
        )

        if reserva:
            estado = reserva.estado

        resultado.append({
            "id": mesa.id,
            "nombre": mesa.nombre,
            "capacidad": mesa.capacidad,
            "estado": estado
        })

    return resultado
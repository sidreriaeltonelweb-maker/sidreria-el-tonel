from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.reservation import Reservation
from app.models.table import Table
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def estadisticas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    hoy = date.today()
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    fin_semana = inicio_semana + timedelta(days=6)

    reservas_hoy = db.query(Reservation).filter(Reservation.fecha == hoy).all()
    reservas_semana = db.query(Reservation).filter(
        Reservation.fecha >= inicio_semana,
        Reservation.fecha <= fin_semana,
    ).all()
    mesas_activas = db.query(Table).filter(Table.activa == True).count()
    mesas_ocupadas_hoy = {
        reserva.mesa_id
        for reserva in reservas_hoy
        if reserva.mesa_id and reserva.estado in ["pendiente", "confirmada"]
    }
    proximas = db.query(Reservation).filter(
        Reservation.fecha >= hoy,
        Reservation.estado.in_(["pendiente", "confirmada"]),
    ).order_by(Reservation.fecha, Reservation.hora).limit(6).all()

    ocupacion = 0
    if mesas_activas:
        ocupacion = round((len(mesas_ocupadas_hoy) / mesas_activas) * 100)

    return {
        "reservas_hoy": len([reserva for reserva in reservas_hoy if reserva.estado != "cancelada"]),
        "pendientes_hoy": len([reserva for reserva in reservas_hoy if reserva.estado == "pendiente"]),
        "confirmadas_hoy": len([reserva for reserva in reservas_hoy if reserva.estado == "confirmada"]),
        "canceladas_hoy": len([reserva for reserva in reservas_hoy if reserva.estado == "cancelada"]),
        "reservas_semana": len([reserva for reserva in reservas_semana if reserva.estado != "cancelada"]),
        "canceladas_semana": len([reserva for reserva in reservas_semana if reserva.estado == "cancelada"]),
        "ocupacion_hoy": ocupacion,
        "mesas_activas": mesas_activas,
        "proximas_reservas": [
            {
                "id": reserva.id,
                "cliente_nombre": reserva.cliente_nombre,
                "personas": reserva.personas,
                "fecha": reserva.fecha,
                "hora": reserva.hora,
                "estado": reserva.estado,
                "mesa_id": reserva.mesa_id,
            }
            for reserva in proximas
        ],
    }


@router.get("/mesas")
def estado_mesas(fecha: date | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fecha = fecha or date.today()
    resultado = []
    mesas = db.query(Table).order_by(Table.id).all()
    for mesa in mesas:
        estado = "libre"
        reserva = db.query(Reservation).filter(
            Reservation.mesa_id == mesa.id,
            Reservation.fecha == fecha,
            Reservation.estado.in_(["pendiente", "confirmada"]),
        ).first()
        if reserva:
            estado = reserva.estado
        resultado.append({"id": mesa.id, "nombre": mesa.nombre, "capacidad": mesa.capacidad, "zona": mesa.zona, "activa": mesa.activa, "estado": estado if mesa.activa else "inactiva"})
    return resultado

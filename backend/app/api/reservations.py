from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, require_encargado_or_admin
from app.db.database import get_db
from app.models.reservation import Reservation
from app.models.table import Table
from app.models.user import User
from app.schemas.reservation import ReservationAssignTable, ReservationCreate

router = APIRouter(prefix="/reservas", tags=["Reservas"])


@router.get("/")
def listar_reservas(fecha: str | None = None, estado: str | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Reservation)
    if fecha:
        query = query.filter(Reservation.fecha == fecha)
    if estado:
        query = query.filter(Reservation.estado == estado)
    return query.order_by(Reservation.fecha, Reservation.hora).all()


@router.post("/")
def crear_reserva(data: ReservationCreate, db: Session = Depends(get_db)):
    ocupadas = db.query(Reservation.mesa_id).filter(
        Reservation.fecha == data.fecha,
        Reservation.hora == data.hora,
        Reservation.estado.in_(["pendiente", "confirmada"]),
        Reservation.mesa_id.isnot(None),
    ).all()
    ids = [m[0] for m in ocupadas]
    mesa = db.query(Table).filter(Table.activa == True, Table.capacidad >= data.personas, ~Table.id.in_(ids)).order_by(Table.capacidad.asc()).first()
    reserva = Reservation(
        cliente_nombre=data.cliente_nombre,
        cliente_telefono=data.cliente_telefono,
        personas=data.personas,
        fecha=data.fecha,
        hora=data.hora,
        observaciones=data.observaciones,
        estado="pendiente",
        mesa_id=mesa.id if mesa else None,
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return reserva


@router.patch("/{reserva_id}/asignar-mesa")
def asignar_mesa(reserva_id: int, data: ReservationAssignTable, db: Session = Depends(get_db), current_user: User = Depends(require_encargado_or_admin)):
    reserva = db.query(Reservation).filter(Reservation.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    mesa = db.query(Table).filter(Table.id == data.mesa_id, Table.activa == True).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada o inactiva")
    reserva.mesa_id = mesa.id
    db.commit()
    db.refresh(reserva)
    return reserva


@router.patch("/{reserva_id}/confirmar")
def confirmar_reserva(reserva_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_encargado_or_admin)):
    reserva = db.query(Reservation).filter(Reservation.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if not reserva.mesa_id:
        raise HTTPException(status_code=400, detail="Debes asignar una mesa antes de confirmar")
    reserva.estado = "confirmada"
    db.commit()
    db.refresh(reserva)
    return reserva


@router.patch("/{reserva_id}/cancelar")
def cancelar_reserva(reserva_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_encargado_or_admin)):
    reserva = db.query(Reservation).filter(Reservation.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    reserva.estado = "cancelada"
    db.commit()
    db.refresh(reserva)
    return reserva

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, require_admin
from app.db.database import get_db
from app.models.reservation import Reservation
from app.models.table import Table
from app.models.user import User
from app.schemas.table import TableCreate, TableUpdate

router = APIRouter(prefix="/mesas", tags=["Mesas"])


@router.get("/")
def listar_mesas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Table).order_by(Table.id).all()


@router.post("/")
def crear_mesa(data: TableCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if db.query(Table).filter(Table.nombre == data.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe una mesa con ese nombre")
    mesa = Table(nombre=data.nombre, capacidad=data.capacidad, zona=data.zona, activa=True)
    db.add(mesa)
    db.commit()
    db.refresh(mesa)
    return mesa


@router.patch("/{mesa_id}")
def actualizar_mesa(mesa_id: int, data: TableUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    cambios = data.model_dump(exclude_unset=True)
    nuevo_nombre = cambios.get("nombre")
    if nuevo_nombre and db.query(Table).filter(
        Table.id != mesa.id, Table.nombre == nuevo_nombre
    ).first():
        raise HTTPException(status_code=400, detail="Ya existe una mesa con ese nombre")

    nueva_zona = cambios.get("zona")
    if nueva_zona and nueva_zona != mesa.zona:
        db.query(Reservation).filter(
            Reservation.mesa_id == mesa.id,
            Reservation.fecha >= date.today(),
            Reservation.estado.in_(["pendiente", "confirmada"]),
        ).update(
            {Reservation.zona_preferida: nueva_zona},
            synchronize_session=False,
        )

    for field, value in cambios.items():
        setattr(mesa, field, value)
    db.commit()
    db.refresh(mesa)
    return mesa


@router.delete("/{mesa_id}")
def desactivar_mesa(mesa_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    mesa = db.query(Table).filter(Table.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    mesa.activa = False
    db.commit()
    db.refresh(mesa)
    return {"message": "Mesa desactivada", "mesa": mesa}

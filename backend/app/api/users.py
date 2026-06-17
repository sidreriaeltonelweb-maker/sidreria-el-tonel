from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import require_admin
from app.core.security import hash_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/")
def listar_usuarios(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).order_by(User.id).all()


@router.post("/")
def crear_usuario(data: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese email")
    if data.rol not in ["admin", "encargado", "empleado"]:
        raise HTTPException(status_code=400, detail="Rol no válido")
    user = User(nombre=data.nombre, email=data.email, password_hash=hash_password(data.password), rol=data.rol, activo=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/toggle")
def activar_desactivar_usuario(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propio usuario")
    user.activo = not user.activo
    db.commit()
    db.refresh(user)
    return user

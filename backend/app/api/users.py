from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/")
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(User).all()


@router.post("/")
def crear_usuario(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=pwd_context.hash(data.password),
        rol=data.rol,
        activo=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
from fastapi import HTTPException


@router.patch("/{user_id}/toggle")
def activar_desactivar_usuario(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.activo = not user.activo
    db.commit()
    db.refresh(user)

    return user
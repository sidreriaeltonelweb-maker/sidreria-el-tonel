from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    if not user.activo:
        raise HTTPException(
            status_code=403,
            detail="Usuario desactivado"
        )

    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "rol": user.rol
        }
    )

    return {
        "message": "Login correcto",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "rol": user.rol
        }
    }
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.database import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = db.query(User).filter(User.email == email).first()

    if not user or not user.activo:
        raise HTTPException(status_code=401, detail="Usuario no autorizado")

    return user


def require_admin(user: User = Depends(get_current_user)):
    if user.rol != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores")
    return user


def require_encargado_or_admin(user: User = Depends(get_current_user)):
    if user.rol not in ["admin", "encargado"]:
        raise HTTPException(status_code=403, detail="Permiso insuficiente")
    return user
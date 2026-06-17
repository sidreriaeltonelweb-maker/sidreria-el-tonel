from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from app.db.database import Base


class User(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="empleado")
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

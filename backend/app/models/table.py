from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from app.db.database import Base


class Table(Base):
    __tablename__ = "mesas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    capacidad = Column(Integer, nullable=False)
    zona = Column(String, default="principal")
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

from datetime import datetime
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Time
from app.db.database import Base


class Reservation(Base):
    __tablename__ = "reservas"
    id = Column(Integer, primary_key=True, index=True)
    cliente_nombre = Column(String, nullable=False)
    cliente_telefono = Column(String, nullable=False)
    personas = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    estado = Column(String, default="pendiente")
    zona_preferida = Column(String, nullable=False, default="interior")
    observaciones = Column(String, nullable=True)
    mesa_id = Column(Integer, ForeignKey("mesas.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

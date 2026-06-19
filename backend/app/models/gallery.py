from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.database import Base


class GalleryImage(Base):
    __tablename__ = "galeria_imagenes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    public_id = Column(String, nullable=True)
    alt = Column(String, nullable=False, default="Sidrería El Tonel")
    orden = Column(Integer, nullable=False, default=0)
    activa = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

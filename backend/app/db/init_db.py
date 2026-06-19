from sqlalchemy import inspect, text

from app.db.database import Base, engine
from app.models.reservation import Reservation
from app.models.gallery import GalleryImage
from app.models.table import Table
from app.models.user import User


def init_db():
    Base.metadata.create_all(bind=engine)
    columnas_reservas = {
        columna["name"] for columna in inspect(engine).get_columns("reservas")
    }
    if "zona_preferida" not in columnas_reservas:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE reservas ADD COLUMN zona_preferida "
                    "VARCHAR NOT NULL DEFAULT 'interior'"
                )
            )
    if "hora_fin" not in columnas_reservas:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE reservas ADD COLUMN hora_fin TIME")
            )
    if "google_event_id" not in columnas_reservas:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE reservas ADD COLUMN google_event_id VARCHAR")
            )


if __name__ == "__main__":
    init_db()
    print("Tablas creadas correctamente")

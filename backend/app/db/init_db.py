from app.db.database import Base, engine
from app.models.reservation import Reservation
from app.models.table import Table
from app.models.user import User


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Tablas creadas correctamente")

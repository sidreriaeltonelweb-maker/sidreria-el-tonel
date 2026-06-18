import os
from datetime import date, datetime, time, timedelta

from app.core.security import hash_password, verify_password
from app.db.init_db import init_db
from app.db.database import SessionLocal
from app.models.reservation import Reservation
from app.models.table import Table
from app.models.user import User


def seed_data() -> None:
    init_db()
    db = SessionLocal()
    admin_email = os.getenv(
        "ADMIN_EMAIL", "admin@sidreriaeltonel.local"
    ).strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD")

    try:
        admin = db.query(User).filter(User.email == admin_email).first()

        if not admin:
            initial_password = admin_password or "admin123"
            admin = User(
                nombre="Administrador",
                email=admin_email,
                password_hash=hash_password(initial_password),
                rol="admin",
                activo=True,
            )
            db.add(admin)
        elif admin_password and not verify_password(
            admin_password, admin.password_hash
        ):
            admin.password_hash = hash_password(admin_password)
            admin.activo = True

        for nombre, capacidad in [
            ("Mesa 1", 2), ("Mesa 2", 2), ("Mesa 3", 4),
            ("Mesa 4", 4), ("Mesa 5", 4), ("Mesa 6", 4),
            ("Mesa 7", 6), ("Mesa 8", 6), ("Mesa 9", 2),
            ("Mesa 10", 2), ("Mesa 11", 4), ("Mesa 12", 4),
            ("Mesa 13", 6), ("Mesa 14", 8), ("Mesa 15", 8),
        ]:
            if not db.query(Table).filter(Table.nombre == nombre).first():
                db.add(
                    Table(
                        nombre=nombre,
                        capacidad=capacidad,
                        zona="interior" if int(nombre.split()[-1]) <= 10 else "exterior",
                        activa=True,
                    )
                )

        for mesa in db.query(Table).filter(
            Table.zona.in_(["principal", "salon", "salón", ""])
            | Table.zona.is_(None)
        ):
            try:
                numero = int(mesa.nombre.split()[-1])
            except (ValueError, IndexError):
                numero = 1
            mesa.zona = "interior" if numero <= 10 else "exterior"

        db.flush()
        zonas_por_mesa = {
            mesa.id: mesa.zona for mesa in db.query(Table).all()
        }
        for reserva in db.query(Reservation).filter(
            Reservation.mesa_id.isnot(None)
        ):
            reserva.zona_preferida = zonas_por_mesa.get(
                reserva.mesa_id, reserva.zona_preferida
            )

        for reserva in db.query(Reservation).filter(
            Reservation.hora_fin.is_(None)
        ):
            fin_calculado = datetime.combine(date.today(), reserva.hora) + timedelta(hours=2)
            reserva.hora_fin = min(fin_calculado.time(), time(23, 0))

        db.commit()
    finally:
        db.close()

    print("Datos iniciales creados")
    print("Usuario:", admin_email)
    print("Contraseña de administrador configurada:", bool(admin_password))


if __name__ == "__main__":
    seed_data()

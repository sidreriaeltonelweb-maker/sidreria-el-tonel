import os
from datetime import date, datetime, time, timedelta

from app.core.security import hash_password, verify_password
from app.db.init_db import init_db
from app.db.database import SessionLocal
from app.models.reservation import Reservation
from app.models.gallery import GalleryImage
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

        if not db.query(GalleryImage).first():
            imagenes_iniciales = [
                ("https://lh3.googleusercontent.com/gps-cs-s/APNQkAFfrXqaY4gKPTfYtshYOWaFWFcxyrdh8pEkQehajcI7MFj2_6UfnKf64KoRzXSQHfBINGN2-wjpFhdUjwYhPEEiOxThn5kzXbY-6qdbfPqt12ncaVeAjpbYVSybtic4qv_9s2Hy=s680-w680-h510-rw", "Fachada de Sidrería El Tonel"),
                ("https://lh3.googleusercontent.com/gps-cs-s/APNQkAExy0RL5y0MUE_y46llWruh2FGv_RBUCfhMHtsg22RO6JuxxrBPwDrN5ezEu9q27eUEC__FtqubpstPnJEeQpHJLQ7s73LKan86zHiMZ1QhyrsOtSATqoUd85T6X5dmBvdlgR8=s680-w680-h510-rw", "Restaurante Sidrería El Tonel"),
                ("https://lh3.googleusercontent.com/gps-cs-s/APNQkAEuQ1XqM4sxyOy5gAAtFazHfY1dNEMHffDLPJNJBavbw9cU3kTsnaz2bKe1aQKA2DTY89mPvw1pKcIBGrLGcybk_etPQXIvTXCqHw1Uc_S-ntWS-6XIhNaNslzg0ZboAewTf6uvjhQ5kvBR=s680-w680-h510-rw", "Comedor de Sidrería El Tonel"),
                ("https://lh3.googleusercontent.com/gps-cs-s/APNQkAEKINq1M0SN1HsL_3B3DJq7bDYKWuyBbvt7ttkBXZe1VbCrBpArKtAwzinlSKMyJErPrhFNd58gonFRSNNxu9ndoQyz2Whcy-enFHsFLmxpYyYKDWirCmN6snmL1L6DqZOpXofayQ=s680-w680-h510-rw", "Mesa del restaurante"),
            ]
            for orden, (url, alt) in enumerate(imagenes_iniciales, start=1):
                db.add(GalleryImage(url=url, alt=alt, orden=orden, activa=True))

        db.commit()
    finally:
        db.close()

    print("Datos iniciales creados")
    print("Usuario:", admin_email)
    print("Contraseña de administrador configurada:", bool(admin_password))


if __name__ == "__main__":
    seed_data()

from app.core.security import hash_password
from app.db.init_db import init_db
from app.db.database import SessionLocal
from app.models.table import Table
from app.models.user import User

init_db()

db = SessionLocal()
admin_email = "admin@sidreriaeltonel.local"

if not db.query(User).filter(User.email == admin_email).first():
    db.add(User(nombre="Administrador", email=admin_email, password_hash=hash_password("admin123"), rol="admin", activo=True))

for nombre, capacidad in [
    ("Mesa 1", 2), ("Mesa 2", 2), ("Mesa 3", 4), ("Mesa 4", 4), ("Mesa 5", 4),
    ("Mesa 6", 4), ("Mesa 7", 6), ("Mesa 8", 6), ("Mesa 9", 2), ("Mesa 10", 2),
    ("Mesa 11", 4), ("Mesa 12", 4), ("Mesa 13", 6), ("Mesa 14", 8), ("Mesa 15", 8),
]:
    if not db.query(Table).filter(Table.nombre == nombre).first():
        db.add(Table(nombre=nombre, capacidad=capacidad, zona="principal", activa=True))

db.commit()
db.close()
print("Datos iniciales creados")
print("Usuario:", admin_email)
print("Contraseña: admin123")

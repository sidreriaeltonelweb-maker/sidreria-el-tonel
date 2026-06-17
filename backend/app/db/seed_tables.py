from app.db.database import SessionLocal
from app.models.table import Table

db = SessionLocal()

mesas_iniciales = [
    ("Mesa 1", 2), ("Mesa 2", 2), ("Mesa 3", 4),
    ("Mesa 4", 4), ("Mesa 5", 4), ("Mesa 6", 4),
    ("Mesa 7", 6), ("Mesa 8", 6), ("Mesa 9", 2),
    ("Mesa 10", 2), ("Mesa 11", 4), ("Mesa 12", 4),
    ("Mesa 13", 6), ("Mesa 14", 8), ("Mesa 15", 8),
]

for nombre, capacidad in mesas_iniciales:
    existe = db.query(Table).filter(Table.nombre == nombre).first()
    if not existe:
        mesa = Table(
            nombre=nombre,
            capacidad=capacidad,
            zona="principal",
            activa=True
        )
        db.add(mesa)

db.commit()
db.close()

print("Mesas iniciales creadas correctamente")
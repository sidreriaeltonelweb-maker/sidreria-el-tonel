from app.db.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

email = "admin@sidreriaeltonel.local"
password = "admin123"

existing_user = db.query(User).filter(User.email == email).first()

if existing_user:
    print("El administrador ya existe")
else:
    admin = User(
        nombre="Administrador",
        email=email,
        password_hash=pwd_context.hash(password),
        rol="admin",
        activo=True
    )
    db.add(admin)
    db.commit()
    print("Administrador creado correctamente")
    print("Email:", email)
    print("Password:", password)

db.close()
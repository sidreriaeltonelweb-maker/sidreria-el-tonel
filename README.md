# Sidrería El Tonel - Versión 1.0 limpia

Incluye:
- Backend FastAPI con JWT, roles, usuarios, mesas y reservas.
- Panel PWA para empleados.
- Web pública con formulario de reservas.

## Backend local
```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python -m app.db.init_db
python -m app.db.seed
python -m uvicorn app.main:app --reload
```

Usuario inicial:
- admin@sidreriaeltonel.local
- admin123

## Frontend local
```powershell
cd frontend
npm install
npm run dev
```

## Render
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT

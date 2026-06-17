# Sidrería El Tonel

Incluye:
- Backend FastAPI con JWT, roles, usuarios, mesas, reservas y validaciones.
- Panel PWA para empleados con sesión persistente, reservas, mesas y usuarios.
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

En local, el panel usa `http://127.0.0.1:8000` como API si no existe `VITE_API_URL`.

## Publicación del backend en Render

Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python -m app.db.seed && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT

Variables recomendadas:
- ENVIRONMENT=production
- SECRET_KEY=una_clave_larga_y_privada
- DATABASE_URL=postgresql://usuario:password@host:5432/sidreria_el_tonel
- ALLOWED_ORIGINS=https://tu-panel.vercel.app,https://tu-web-publica.com

Hay una plantilla de producción en `backend/.env.production.example`.

## Publicación del panel
Despliega la carpeta `frontend` en Vercel, Netlify o similar.

Variable del frontend:
- VITE_API_URL=https://tu-backend.onrender.com

Comando de build:
```powershell
npm run build
```

Directorio de salida:
```text
dist
```

## App instalable en móviles
El panel está preparado como PWA.

Android/Chrome:
- Abre la URL publicada del panel.
- Inicia sesión.
- Pulsa `Instalar app` si aparece, o usa el menú del navegador y `Instalar aplicación`.

iPhone/Safari:
- Abre la URL publicada del panel.
- Pulsa compartir.
- Elige `Añadir a pantalla de inicio`.

Para que sea instalable en producción:
- La web debe publicarse con HTTPS.
- `VITE_API_URL` debe apuntar al backend publicado.
- El backend debe incluir el dominio del panel en `ALLOWED_ORIGINS`.

Consulta `docs/CHECKLIST_PUBLICACION.md` antes de entregar la app a un cliente.

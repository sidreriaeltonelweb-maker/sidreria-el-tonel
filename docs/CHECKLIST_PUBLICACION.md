# Checklist de publicación

## Backend
- Publicar `backend` en Render o servidor equivalente.
- Usar PostgreSQL en producción.
- Definir `DATABASE_URL` con la URL de PostgreSQL.
- Cambiar `SECRET_KEY` por una clave larga y privada.
- Definir `ALLOWED_ORIGINS` con los dominios reales del panel y la web pública.
- Confirmar que `/` responde `online`.
- Confirmar que `/docs` no expone datos sensibles.

## Panel PWA
- Publicar `frontend` en Vercel, Netlify o similar.
- Definir `VITE_API_URL` con la URL real del backend.
- Confirmar que `manifest.json`, `sw.js`, `icon-192.png` e `icon-512.png` cargan con HTTPS.
- En Android, probar `Instalar app`.
- En iPhone, probar `Compartir > Añadir a pantalla de inicio`.

## Web pública
- Publicar `web_publica` o el proyecto `tonel` en un dominio propio.
- Cambiar la URL remota del backend si no usas `https://sidreria-el-tonel.onrender.com`.
- Añadir ese dominio público a `ALLOWED_ORIGINS`.
- Hacer una reserva de prueba desde móvil.

## Antes de vender
- Cambiar la contraseña inicial `admin123`.
- Crear usuarios reales por rol.
- Revisar carta, fotos, teléfono y horarios.
- Probar reservas en Android, iPhone y ordenador.
- Hacer copia de seguridad de la base de datos.

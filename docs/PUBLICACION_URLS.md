# URLs de publicación

## Web pública
La web pública se despliega con GitHub Pages desde la carpeta `web_publica`.

URL esperada:
https://sidreriaeltonelweb-maker.github.io/sidreria-el-tonel/

Si GitHub Pages no se activa automáticamente:
1. Entra en GitHub.
2. Abre el repositorio `sidreria-el-tonel`.
3. Ve a `Settings > Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Ejecuta el workflow `Publish public website`.

## Backend API
El backend debe desplegarse en Render desde `render.yaml`.

URL usada actualmente por la web:
https://sidreria-el-tonel.onrender.com

Cuando Render esté activo, comprueba:
https://sidreria-el-tonel.onrender.com/

## Panel instalable PWA
El panel PWA está en la carpeta `frontend`.

Publicación recomendada:
- Vercel o Netlify
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Variable: `VITE_API_URL=https://sidreria-el-tonel.onrender.com`

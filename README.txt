WEB SIDRERÍA EL TONEL - RESERVAS

Archivos principales:
- index.html: web principal.
- reservas.html: web pública de reservas.
- carta.html: carta.
- estilos.css: estilos externos.
- imagenes/fototonel.jpg: imagen del restaurante.

IMPORTANTE:
index.html y reservas.html usan automáticamente:
- http://127.0.0.1:8000 cuando abres la web en local.
- https://sidreria-el-tonel.onrender.com cuando está publicada.

Si publicas el backend con otra URL, cambia la constante API_URL en los scripts.

También añade ese dominio en backend/.env:
ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com

El formulario envía reservas a:
POST /reservas/

Para probar esta web en local:
python -m http.server 8090 --bind 127.0.0.1

Después abre:
http://127.0.0.1:8090/reservas.html

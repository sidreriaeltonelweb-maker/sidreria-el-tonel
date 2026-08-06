WEB SIDRERIA EL TONEL

Archivos principales:
- index.html: web principal.
- reservas.html: pagina de contacto sin reserva online.
- carta.html: carta.
- estilos.css: estilos externos.
- imagenes/fototonel.jpg: imagen del restaurante.

IMPORTANTE:
index.html usa automaticamente:
- http://127.0.0.1:8000 cuando abres la web en local.
- https://sidreria-el-tonel.onrender.com cuando esta publicada.

La web publica ya no envia reservas online. Para consultas o reservas muestra el telefono del restaurante.

Para probar esta web en local:
python -m http.server 8090 --bind 127.0.0.1

Despues abre:
http://127.0.0.1:8090/

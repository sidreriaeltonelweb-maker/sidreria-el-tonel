# Integraciones de contenido

Las credenciales se guardan exclusivamente como variables privadas del servicio en Render.
Nunca deben incluirse en Git ni en archivos publicados por GitHub Pages.

## Fotografías con Cloudinary

1. Crear una cuenta en Cloudinary.
2. Copiar desde el panel `Cloud name`, `API key` y `API secret`.
3. Añadir en Render:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Desplegar de nuevo el servicio.

El administrador podrá entrar en `/admin.html` con su usuario habitual, subir imágenes de hasta 8 MB, ordenarlas, ocultarlas o eliminarlas. Las imágenes se sirven optimizadas en formato y calidad automáticos.

## Reservas en Google Calendar

1. Crear o seleccionar un proyecto en Google Cloud Console.
2. Activar **Google Calendar API**.
3. Crear una cuenta de servicio y descargar su clave JSON.
4. En Google Calendar, abrir la configuración del calendario del restaurante y compartirlo con el correo de la cuenta de servicio, con permiso para modificar eventos.
5. Copiar el identificador del calendario desde **Integrar calendario**.
6. Añadir en Render:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: JSON completo en una sola línea o su contenido codificado en Base64.
   - `GOOGLE_CALENDAR_ID`: identificador del calendario compartido.
7. Desplegar de nuevo el servicio.

Al confirmar una reserva se crea el evento. Si se reasigna la mesa, el evento se actualiza. Si se cancela la reserva, el evento se elimina.

## Reseñas de Google

1. En el mismo proyecto de Google Cloud, activar **Places API (New)** y la facturación requerida por Google Maps Platform.
2. Crear una API key restringida a Places API.
3. Añadir en Render:
   - `GOOGLE_PLACES_API_KEY`
   - `GOOGLE_PLACE_ID` es opcional: si queda vacío, el sistema localiza la ficha por nombre y por las coordenadas de Soto de Cangas.
4. Desplegar de nuevo el servicio.

La web muestra la puntuación, el total y las reseñas devueltas por Google, con enlace a Google Maps. La respuesta se almacena en caché durante seis horas para limitar consumo y coste.

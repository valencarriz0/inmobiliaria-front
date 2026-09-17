# Gestión de propiedades del publicador

El panel de publicador usa los endpoints `/api/publisher/properties` para listar, crear, editar, pausar, reactivar, eliminar y consultar el historial de sus propiedades. El backend identifica al publicador a partir del token de la sesión.

Las imágenes nuevas se cargan con `POST /api/publisher/property-images` mediante `FormData`. Al guardar una propiedad se conservan las URLs existentes y sólo se suben los archivos nuevos. Si la creación o edición falla después de una subida, el frontend intenta eliminar los archivos cargados en esa operación.

La eliminación es lógica: la publicación deja de estar disponible en el catálogo, pero permanece registrada. El panel muestra propiedades activas y pausadas, permite filtrarlas y muestra métricas de visitas y consultas.

La ubicación se selecciona desde la API. Las coordenadas sólo se envían después de confirmar un resultado de geocodificación; si se modifica la dirección, se eliminan hasta volver a confirmarla.

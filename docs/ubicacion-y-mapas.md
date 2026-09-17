# Ubicación y mapas

El frontend consulta las ubicaciones únicamente mediante la API propia:

- `GET /api/locations/provinces` carga las provincias del formulario.
- `GET /api/locations/cities?provinceId=...` carga las localidades de la provincia elegida.
- `GET /api/locations/search?q=...` alimenta el autocompletado de filtros después de dos caracteres y una espera de 300 ms.
- `POST /api/locations/geocode` busca una dirección solamente al presionar **Buscar ubicación**. Requiere la sesión de publicador o administrador.

El formulario conserva `provinceId` y `cityId` junto con los nombres mostrados. Una coordenada sólo se incorpora después de elegir un resultado y presionar **Confirmar ubicación**. Si cambian provincia, localidad, calle o altura, esa confirmación se invalida y se eliminan las coordenadas.

Los mapas usan React Leaflet, Leaflet y las teselas de OpenStreetMap con la atribución visible. El detalle público recibe las coordenadas desde el catálogo real y muestra el mapa sólo cuando la latitud y longitud son válidas; de otro modo indica que la ubicación exacta aún no está disponible.

La aplicación no consulta Nominatim desde el navegador: toda geocodificación pasa por el backend.

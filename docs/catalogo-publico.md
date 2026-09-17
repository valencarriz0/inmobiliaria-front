# Catálogo público

El catálogo se muestra en `/` y el detalle en `/detail/:id`. Son las únicas pantallas de catálogo y detalle: se adaptan automáticamente cuando hay una sesión iniciada.

El frontend consulta `GET /api/properties` para el listado y `GET /api/properties/:id` para el detalle. No envía token en esas consultas. Sólo se muestran propiedades activas y disponibles para el público.

La búsqueda admite operación, tipo de inmueble, provincia o localidad, moneda y rango de precio. El orden y la paginación se envían en la URL, por lo que se pueden compartir o recuperar al volver atrás.

Desde el detalle se registra una visualización y se guarda la propiedad en la lista local de recientes. Esa lista usa `sessionStorage`; no reemplaza el historial de vistas de una persona autenticada.

Quien tiene sesión puede guardar favoritos y crear una alerta a partir de la búsqueda actual. El detalle también completa los datos de contacto disponibles al abrir el formulario de consulta.

Las rutas antiguas `/HomePageLogin`, `/detailLogin` y `/detailLogin/:id` redirigen a las rutas actuales para conservar compatibilidad con enlaces existentes.

## Verificación manual

1. Abrir `/` sin sesión y realizar una búsqueda.
2. Cambiar el orden y la página; confirmar que la URL se actualiza.
3. Abrir un detalle y volver al catálogo.
4. Iniciar sesión, volver al catálogo y crear una alerta o guardar un favorito.

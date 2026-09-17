# Administración

Las pantallas de administración requieren una sesión con rol `admin`. Todas las solicitudes incluyen el token de la sesión actual.

El panel principal, en `/admin`, muestra usuarios registrados, publicadores, publicaciones activas y pausadas, visualizaciones y consultas. Desde allí también se consulta el listado de publicaciones.

Las rutas `/admin/users` y `/admin/applications` permiten administrar usuarios y revisar solicitudes para convertirse en publicador. El detalle de una publicación se abre en `/admin/properties/:id` y permite consultar su historial, pausarla, reactivarla o eliminarla de forma lógica.

La comunicación con estos endpoints está centralizada en `src/services/adminService.ts`.

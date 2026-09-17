# Interacciones y métricas

El detalle de una propiedad registra una visualización mediante la API. Para personas autenticadas, el backend asocia esa visualización a la cuenta y permite consultar el historial en “Propiedades vistas”. La lista de recientes del navegador es independiente y usa `sessionStorage`.

Los favoritos se administran desde “Mis favoritos”. Las consultas se pueden crear como visitante o con sesión; cada persona ve las que realizó y cada publicador ve las recibidas.

Las alertas se crean desde el catálogo con los filtros actuales y se administran en “Mis alertas”. Cuando una propiedad coincide con una alerta, el sistema puede generar una notificación. El menú de notificaciones permite marcar una o todas como leídas.

Los publicadores ven métricas por propiedad y los administradores ven métricas generales. Todas estas funciones usan la API y el token de la sesión cuando corresponde.

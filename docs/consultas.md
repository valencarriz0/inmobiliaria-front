# Consultas

El formulario del detalle de una propiedad usa `POST /api/properties/:id/consultations`. Puede enviarlo una persona visitante o autenticada. Cuando hay sesión, el formulario completa inicialmente los datos disponibles del perfil.

Las consultas hechas por una cuenta se muestran en “Mis consultas” con `GET /api/users/me/consultations`. Un publicador ve las recibidas en “Consultas recibidas” mediante `GET /api/publisher/consultations`. El backend decide qué consultas corresponden a cada cuenta.

Las tarjetas usan la propiedad incluida en cada respuesta y validan que contenga entre dos y cinco imágenes. La primera se muestra como portada. Si la respuesta no cumple ese contrato, se informa un error en lugar de mostrar información incompleta.

Las pruebas relacionadas se ejecutan con `npm test` e incluyen creación con y sin token, ambos listados, errores de API y validación del mapeo de imágenes.

## Verificación manual

1. Como visitante, abrir una propiedad, completar el formulario y enviarlo. Luego iniciar sesión como su publicador y verificar la consulta en “Consultas recibidas”.
2. Como interesado, abrir una propiedad, comprobar los datos precargados, enviar la consulta y revisar “Mis consultas”. La misma consulta debe verse para el publicador.

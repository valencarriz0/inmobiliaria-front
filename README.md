# InmuConnect - Frontend

Aplicación web para buscar, publicar y administrar propiedades. Está desarrollada con React y se conecta al backend de InmuConnect mediante una API REST.

## Tecnologías

- React y TypeScript
- Vite
- React Router
- Tailwind CSS y Radix UI
- React Leaflet y OpenStreetMap

## Puesta en marcha

Instalá las dependencias y levantá el proyecto:

```bash
npm install
npm run dev
```

Por defecto, el frontend busca la API en `http://localhost:3000/api`. Si el backend usa otra dirección, creá un archivo `.env` con:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Funcionalidades

### Catálogo y detalle

El catálogo está disponible en `/` y el detalle de una propiedad en `/detail/:id`. Ambas pantallas se adaptan a la sesión activa: una persona visitante puede buscar y enviar consultas; una persona autenticada además puede usar favoritos, alertas e historial de vistas según su rol.

La búsqueda permite filtrar por operación, tipo de propiedad, ubicación, moneda y rango de precios. Los filtros, el orden y la página se conservan en la URL. Las propiedades pausadas o eliminadas no aparecen en el catálogo público.

Las rutas anteriores `/HomePageLogin` y `/detailLogin/:id` siguen redirigiendo a las rutas actuales para no romper enlaces guardados.

### Cuentas y perfiles

Incluye registro, inicio de sesión, verificación de correo, recuperación de contraseña y edición de perfil. El acceso a cada sección se controla según el rol: interesado, publicador o administrador.

### Interesados

Las personas interesadas pueden guardar favoritos, enviar y consultar sus mensajes, revisar propiedades vistas y crear alertas de búsqueda.

### Publicadores

Los publicadores pueden solicitar su habilitación, administrar sus propiedades, subir imágenes, pausar o reactivar publicaciones, consultar su historial de cambios y ver métricas de visitas y consultas.

### Administración

El panel de administración permite consultar métricas generales, administrar usuarios, revisar solicitudes de publicador y gestionar publicaciones.

## Comandos útiles

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Organización

```text
src/
├── components/  Componentes reutilizables
├── context/     Estado de autenticación
├── hooks/       Hooks de datos y formularios
├── lib/         Validaciones, mapeos y utilidades
├── pages/       Pantallas organizadas por rol
├── routes/      Rutas y controles de acceso
├── services/    Comunicación con la API
└── types/       Tipos de TypeScript

tests/           Pruebas automatizadas
docs/            Documentación funcional y técnica
```

## Documentación complementaria

Los scripts y la documentación de la base de datos están centralizados en el repositorio del backend, dentro de `inmuConnect-back/database/`.

- [Catálogo público](docs/catalogo-publico.md)
- [Gestión de propiedades](docs/gestion-propiedades-publicador.md)
- [Consultas](docs/consultas.md)
- [Interacciones y métricas](docs/interacciones-y-metricas.md)
- [Administración](docs/administracion.md)
- [Ubicación y mapas](docs/ubicacion-y-mapas.md)

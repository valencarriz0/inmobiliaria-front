# Sistema Inmobiliario

Frontend de un sistema web inmobiliario desarrollado como proyecto para la materia Desarrollo de Software.

El sistema busca facilitar la publicación y gestión de propiedades por parte de inmobiliarias y propietarios, y permitir que los usuarios interesados puedan buscar inmuebles utilizando distintos filtros y consultar su información.

Actualmente el proyecto se encuentra en desarrollo y trabaja con datos simulados, ya que todavía no está conectado a un backend.

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI
- Lucide React

## Funcionalidades implementadas

Actualmente el frontend permite trabajar con las principales funcionalidades relacionadas con propiedades.

### Catálogo público

El usuario puede consultar las propiedades disponibles sin necesidad de registrarse.

El buscador permite filtrar por:

- categoría;
- tipo de inmueble;
- ubicación;
- moneda;
- rango de precio.

Las categorías disponibles son Venta, Alquiler y Alquiler temporario.

Los filtros pueden combinarse y la búsqueda se mantiene en la URL, por lo que puede conservarse al actualizar la página o utilizar los botones de navegación del navegador.

Las propiedades pausadas o eliminadas no se muestran en el catálogo público.

### Detalle de propiedades

Cada propiedad cuenta con una vista de detalle donde se muestra la información disponible, entre ella:

- título y descripción;
- categoría;
- tipo de inmueble;
- precio y moneda;
- ubicación;
- superficie;
- ambientes;
- dormitorios y baños, cuando corresponda;
- antigüedad;
- estado del inmueble;
- servicios;
- comodidades;
- cochera;
- aceptación de mascotas;
- expensas, impuestos y comisiones;
- galería de imágenes.

Si una propiedad no existe o no está disponible públicamente, se muestra un mensaje informando la situación.

### Gestión de propiedades

El publicador puede trabajar con sus propiedades mediante un CRUD simulado en el frontend.

Actualmente se puede:

- crear una publicación;
- editar una publicación existente;
- pausar una publicación;
- reactivar una publicación;
- eliminarla de forma lógica.

Las propiedades eliminadas dejan de mostrarse en los listados, pero se mantienen internamente en el store simulado.

### Alta y edición

Los formularios de alta y edición comparten los mismos campos y reglas de validación.

Las publicaciones permiten cargar entre 2 y 5 imágenes en formato JPEG/JPG, PNG o WebP, con un tamaño máximo de 5 MB por archivo nuevo.

Los campos numéricos y opcionales son validados antes de confirmar la operación.

## Organización del frontend

El proyecto está dividido en distintas carpetas según su responsabilidad:

```text
src/
├── components/     Componentes reutilizables de interfaz
├── constants/      Constantes utilizadas por el dominio
├── data/mock/      Datos y store simulados
├── hooks/          Hooks personalizados
├── lib/            Validaciones, formateadores y utilidades
├── pages/          Pantallas de la aplicación
├── routes/         Configuración de rutas
├── services/       Acceso y operaciones sobre los datos
└── types/          Tipos e interfaces de TypeScript

tests/              Pruebas automatizadas
docs/               Documentación complementaria
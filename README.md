# Inmobiliaria: CRUD frontend de demostración

El proyecto usa React, TypeScript y Vite. El CRUD de propiedades funciona durante la sesión del navegador, sin backend ni autenticación real.

## Datos y almacenamiento

El flujo es página/componente → hook cuando corresponde → `propertyService` → store mock en memoria.

- `src/data/mock/properties.ts` es únicamente el seed. Tiene superficies y ambientes obligatorios, valores de demostración ficticios y ejemplos activos/pausados de dos publicadores.
- `src/data/mock/property-store.ts` crea una copia del seed al inicializarse. Las lecturas y escrituras devuelven copias, por lo que modificar una respuesta no modifica el store ni el seed.
- `src/services/propertyService.ts` expone el singleton compartido por la aplicación. Los tests crean un store/service independiente en cada caso y lo liberan al terminar.
- No se utiliza `localStorage`, IndexedDB ni Base64. Recargar la página (o reinicializar el módulo en desarrollo) descarta los cambios y vuelve al seed. Las pestañas tienen sesiones independientes.
- `MOCK_CURRENT_PUBLISHER_ID`, en `src/data/mock/session.ts`, representa al publicador 1 aprobado para esta demostración. La propiedad inicial `4` pertenece al publicador 2 y permite comprobar el rechazo de edición ajena.

## Contrato del service

Todos los métodos son asíncronos:

| Método | Resultado |
| --- | --- |
| `getAllInternal()` | Todos los registros, incluidos los eliminados lógicamente. |
| `getPublicProperties()` | Solo publicaciones `active`. |
| `getPublicPropertyById(id)` | Propiedad activa o `undefined`. |
| `getPropertyById(id)` | Registro interno por ID, o `undefined`. |
| `getPropertiesByPublisher(publisherId)` | Propiedades de ese publicador, excluyendo `deleted`. |
| `createProperty(input, publisherId)` | Crea una propiedad activa con UUID y fechas ISO. |
| `updateProperty(id, input)` | Reemplaza los campos editables y actualiza `updatedAt`. |
| `pauseProperty(id)` | Cambia `active` a `paused`. |
| `reactivateProperty(id)` | Cambia `paused` a `active`. |
| `softDeleteProperty(id)` | Marca `deleted`, conservando el registro y sus imágenes internamente. |

Las escrituras rechazan IDs inexistentes o eliminados con un error. Pausar una pausada o reactivar una activa no produce cambios. Una eliminada no puede reactivarse con estas operaciones.

`CreatePropertyInput` y `UpdatePropertyInput` contienen únicamente datos editables y entradas de imágenes. `PropertyFormValues` sigue usando strings para los inputs numéricos, y `toPropertyInput` los transforma a números. El service reutiliza esa validación y selección explícita de campos: editar conserva ID, publicador, fecha de creación, coordenadas existentes y estado de publicación. Editar una pausada no la reactiva. Los opcionales vacíos se limpian con `undefined`.

Los IDs nuevos se generan con `crypto.randomUUID()`. El tipo de ID es string; los seeds conservan los valores `"1"` a `"6"` para mantener sus URL anteriores. Superficie y ambientes ya no admiten `null`: el seed cumple las mismas reglas que el formulario.

## Imágenes

Las entradas distinguen URL existentes de `File` nuevos. Se mantienen las reglas compartidas de 2–5 imágenes, formatos JPEG/JPG, PNG o WebP y hasta 5 MB por archivo nuevo.

El store convierte los archivos nuevos mediante `URL.createObjectURL` y conserva esas URL mientras estén referenciadas. Son distintas de las previews del formulario: desmontar el formulario no invalida las imágenes de la propiedad guardada. Reemplazar una imagen libera las URL locales que ya no se utilizan; un fallo durante la preparación libera las URL parciales sin guardar una operación incompleta. La eliminación lógica conserva las imágenes del registro.

Estas URL no son persistentes ni se escriben en almacenamiento del navegador. Los archivos y los cambios se pierden al recargar. Las URL externas del seed no incluyen metadatos para revalidar tamaño/MIME. La persistencia real y la validación definitiva requieren backend y almacenamiento de archivos.

## Navegación y estados

- Alta: `/newProperty` → guardar → `/detailPublisher/:id`.
- Edición: `/editProperty/:id` carga ese ID; guardar o cancelar vuelve al detalle del publicador.
- Las rutas antiguas sin ID permanecen, pero muestran propiedad no encontrada/disponible. No eligen otra propiedad como fallback.
- Dashboard: usa `usePublisherProperties` con el publicador mock y muestra `active` y `paused`.
- Los catálogos, con y sin login, usan `useProperties` y solo reciben `active`.
- `useProperty` distingue consulta pública de consulta del publicador y ofrece `refresh()` para volver a leer después de pausar/reactivar. Las listas se cargan al montar la página.
- Detalle y edición del publicador comprueban que la propiedad no esté eliminada y pertenezca al publicador mock. Esto es coherencia de la interfaz, no autorización real.
- El estado mostrado proviene siempre de `property.publicationStatus`. Los únicos estados locales de las acciones son apertura de diálogos, operación pendiente y errores.
- Los formularios bloquean envíos duplicados y muestran errores sin perder lo escrito. Las confirmaciones de pausa/eliminación permanecen abiertas si la operación falla.

## Verificación y próximos pasos

Comandos existentes: `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`. Los tests usan el runner nativo de Node con soporte para TypeScript (Node 24 en el entorno de desarrollo actual).

Recorridos revisados: crear y recuperar desde dashboard/detalle; editar precio/descripción; pausar y excluir del catálogo; reactivar; eliminar conservando el registro interno; ID inexistente sin fallback; edición de `/editProperty/4` rechazada para el publicador mock 1.

Pendiente para la integración real: reemplazar la implementación del service por API REST, persistir archivos, obtener el publicador de la autenticación y aplicar autorización/validación en el servidor. También corresponderá resolver concurrencia entre usuarios, actualización de datos desde otras sesiones y pruebas de interfaz automatizadas. No se agregaron dependencias ni funcionalidades de autenticación, métricas, favoritos o consultas a esta tarea; las demostraciones preexistentes de esas áreas permanecen fuera del CRUD.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

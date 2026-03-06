# Create Publication Wizard

Modulo de creacion de publicaciones en flujo guiado (wizard) conectado al backend.

## Estructura

- `CreatePublicationPage.tsx`: pagina principal, progreso, navegacion y feedback de errores.
- `useCreatePublication.ts`: estado central, validaciones por paso y submit real contra `propertyApi.create` + subida de imagenes con `propertyApi.uploadImage`.
- `OperationStep.tsx`: paso 1, seleccion de operacion.
- `PropertyTypeStep.tsx`: paso 2, seleccion de tipo de propiedad.
- `DetailsStep.tsx`: paso 3, campos dinamicos segun tipo.
- `ImageUploadStep.tsx`: paso 4, carga multiple con preview y eliminacion local antes de enviar.
- `SummaryStep.tsx`: paso 5, resumen final y confirmacion.
- `types.ts`: contratos locales del wizard.

## Contrato de submit actual

`useCreatePublication.submit` ejecuta primero `POST /properties` con:

- `operation` en formato backend (`sale|rent`)
- `propertyType` en formato backend (`house|apartment|land|local_commercial|galpon_deposito`)
- `description`, `price`, `area`, `bedrooms`, `bathrooms`, `parking`
- `title` autogenerado desde tipo + operacion + ciudad
- `contactName` desde usuario autenticado (fallback `Propietario`)
- `contactPhone` opcional desde formulario (si se omite, backend usa fallback del perfil)
- `currency: 'USD'`
- `city` (nombre en texto, backend resuelve `cityId`)
- `address` opcional desde formulario

Luego, si hay archivos en `state.imagenes`, envia cada imagen con `POST /properties/:id/images` en `multipart/form-data` (campo `image`).

Si alguna imagen falla, la propiedad queda creada y el wizard muestra advertencia.

## Eliminacion de imagenes persistidas

El paso de creacion solo maneja seleccion/eliminacion local antes de publicar.
La eliminacion de imagenes ya guardadas se realiza desde `MyPropertiesPage`
usando `DELETE /properties/:id/images/:imageId` a traves de `propertyApi.deleteImage`.

## Dependencias de backend para flujo completo

1. Resolver ciudad sin pedir `cityId` en front (hoy se hace a partir de `city`).
2. Exponer endpoint de upload asociado a propiedad (`POST /properties/:id/images`) para persistir imagenes.

## Extension

1. Agregar nuevos campos en `types.ts`.
2. Actualizar validaciones en `hasStepThreeRequiredFields`.
3. Mapear los nuevos campos en el `payload` de `submit`.
4. Incorporar render del campo en el paso correspondiente.

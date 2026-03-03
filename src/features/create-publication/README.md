# Create Publication Wizard

Modulo de creacion de publicaciones en flujo guiado (wizard) conectado al backend.

## Estructura

- `CreatePublicationPage.tsx`: pagina principal, progreso, navegacion y feedback de errores.
- `useCreatePublication.ts`: estado central, validaciones por paso y submit real contra `propertyApi.create`.
- `OperationStep.tsx`: paso 1, seleccion de operacion.
- `PropertyTypeStep.tsx`: paso 2, seleccion de tipo de propiedad.
- `DetailsStep.tsx`: paso 3, campos dinamicos segun tipo.
- `ImageUploadStep.tsx`: paso 4, carga multiple con preview y eliminacion local.
- `SummaryStep.tsx`: paso 5, resumen final y confirmacion.
- `types.ts`: contratos locales del wizard.

## Contrato de submit actual

`useCreatePublication.submit` envia `POST /properties` con:

- `operation` en formato backend (`sale|rent`)
- `propertyType` en formato backend (`house|apartment|land|local_commercial|galpon_deposito`)
- `description`, `price`, `area`, `bedrooms`, `bathrooms`, `parking`
- `title` autogenerado desde tipo + operacion + ciudad
- `contactName` desde usuario autenticado (fallback `Propietario`)
- `contactPhone` opcional desde formulario (si se omite, backend usa fallback del perfil)
- `currency: 'USD'`
- `city` (nombre en texto, backend resuelve `cityId`)
- `address` opcional desde formulario

## Dependencias de backend para flujo completo

1. Resolver ciudad sin pedir `cityId` en front (hoy se hace a partir de `city`).
2. Si se requiere persistir imagenes, exponer endpoint de upload asociado a propiedad (hoy el wizard solo maneja preview local y no envia archivos al backend).

## Extension

1. Agregar nuevos campos en `types.ts`.
2. Actualizar validaciones en `hasStepThreeRequiredFields`.
3. Mapear los nuevos campos en el `payload` de `submit`.
4. Incorporar render del campo en el paso correspondiente.

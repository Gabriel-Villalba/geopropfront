# Propiedades: panel, creacion y edicion

Este documento resume el flujo de propiedades en el frontend y su integracion con el backend.

## Rutas del panel

- `/panel/properties`: listado y acciones sobre propiedades del usuario autenticado.
- `/panel/properties/create`: wizard de creacion.
- `/panel/properties/:id/edit`: wizard de edicion.

## Reglas por plan (backend)

- `FREE`
- Puede crear multiples propiedades.
- Solo puede tener 1 propiedad activa.
- Si ya tiene una activa, la nueva se crea inactiva.
- Puede destacar propiedades por 15/30/60 dias mediante pago, sin necesidad de pasar a `INMOBILIARIA`.
- `INMOBILIARIA` y `BROKER`
- Sin limite de propiedades activas.
- La nueva se crea activa.

El backend devuelve `message` y `activation` al crear. El frontend muestra ese mensaje como warning luego de crear.

## Flujo de creacion

- Wizard en `src/features/create-publication/CreatePublicationPage.tsx`.
- Hook principal `src/features/create-publication/useCreatePublication.ts` con `mode: "create"`.
- `POST /properties` con payload normalizado.
- Si hay imagenes, se suben con `POST /properties/:id/images`.

## Flujo de edicion

- Ruta `src/pages/panel/properties/edit/index.tsx`.
- Precarga datos con `GET /properties` y filtra la propiedad del usuario.
- Hook `useCreatePublication` en `mode: "edit"` realiza `PUT /properties/:id`.
- Las imagenes existentes se administran en el listado; en edicion solo se agregan nuevas.

## Acciones sobre propiedades

- Activar: `PATCH /properties/:id/activate`
- Desactivar: `PATCH /properties/:id/deactivate`
- Eliminar (logico): `DELETE /properties/:id`
- Renovar listing: `POST /properties/:id/renew`

## Integraciones (simuladas)

Para planes `INMOBILIARIA` y `BROKER` se muestra un bloque con:

- Conectar sistema (simulado)
- Importar CSV/Excel (simulado)

No hay endpoints reales aun para este flujo.

## Archivos principales

- `src/pages/panel/properties/MyPropertiesPage.tsx`
- `src/pages/panel/properties/create/index.tsx`
- `src/pages/panel/properties/edit/index.tsx`
- `src/features/create-publication/*`
- `src/hooks/useOwnerPanel.ts`

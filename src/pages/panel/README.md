# Panel propietario

Esta carpeta implementa la nueva arquitectura modular del panel en rutas independientes:

- `/panel`: dashboard visual con accesos.
- `/panel/profile`: gestion de perfil.
- `/panel/properties`: administracion de propiedades existentes.
- `/panel/properties/create`: entrada al wizard de creacion.
- `/panel/alerts`: gestion de alertas.

## Separacion de responsabilidades

- `PanelDashboard.tsx` contiene solo navegacion visual.
- Cada seccion funcional vive en su propia pagina.
- El flujo de crear publicacion se mueve a `src/features/create-publication`.

## Como agregar nuevas secciones

1. Crear nueva pagina dentro de `src/pages/panel/...`.
2. Agregar tarjeta en `PanelDashboard.tsx`.
3. Registrar ruta en `src/App.tsx`.

## Motivo de eliminacion de OwnerPanel

`OwnerPanel.tsx` mezclaba formulario de propiedad, listado, alertas y estado en un solo componente grande. Se elimino para reducir acoplamiento, facilitar mantenimiento y escalar el panel por modulos.

## Extender el wizard

El wizard se extiende en `src/features/create-publication`:

1. Agregar campo en `types.ts`.
2. Actualizar reglas de validacion en `useCreatePublication.ts`.
3. Añadir UI del campo en el paso correspondiente (`DetailsStep` u otro).

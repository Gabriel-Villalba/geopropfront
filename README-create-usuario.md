# Crear y Editar Usuarios (Frontend)

Guia rapida para usar el panel de usuarios conectado al backend real.

## Requisitos

- Sesion iniciada con rol `admin`.
- `VITE_API_URL` apuntando al backend (ej: `http://localhost:3000/api`).

## Crear Usuario

1. Ir a `/users`.
2. Click en **Crear Usuario**.
3. Completar:
   - `Nombre`
   - `Email`
   - `Contrasena` (min 8 caracteres)
   - `Rol`
   - `Plan (override)`:
     - `Heredar plan del cliente` -> envia `plan: null`
     - `Free` -> envia `plan: "FREE"`
     - `Inmobiliaria` -> envia `plan: "INMOBILIARIA"`
     - `Broker` -> envia `plan: "BROKER"`
   - `Vencimiento del plan` (opcional)
   - `Estado de suscripcion` (opcional)
   - `Usuario activo` (opcional, default `true`)
4. Guardar.

Payload real esperado por el backend:

```json
{
  "roleId": "UUID_ROLE",
  "name": "Juan Perez",
  "email": "juan@correo.com",
  "password": "secret123",
  "active": true,
  "plan": null,
  "planExpiresAt": "2026-12-31T23:59:59.000Z",
  "subscriptionStatus": "active"
}
```

Notas:

- El `clientId` **no** se envia; el backend lo toma del JWT.
- `email` debe ser unico (si no, backend responde `409`).
- En plan `FREE` la restriccion es sobre **propiedades activas** (max 1 activa). Se pueden destacar propiedades por 15/30/60 dias con pago, sin necesidad de pasar a `INMOBILIARIA`.

## Editar Usuario

1. En la lista, click en **Editar**.
2. Modificar campos necesarios:
   - `Rol`, `Email`, `Nombre`, `Plan (override)`, `Vencimiento`, `Estado de suscripcion`, `Usuario activo`.
   - `Nueva contrasena (opcional)`:
     - Dejar vacio para no cambiarla.
3. Guardar cambios.

Payload tipico de update:

```json
{
  "name": "Juan Actualizado",
  "plan": "BROKER",
  "subscriptionStatus": "active"
}
```

## Activar / Desactivar

- Si el usuario esta activo, se usa `DELETE /users/:id` para desactivarlo (soft delete).
- Si esta inactivo, se usa `PUT /users/:id` con `{ "active": true }`.

## Endpoints usados

- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /roles`
- `GET /clients/me`

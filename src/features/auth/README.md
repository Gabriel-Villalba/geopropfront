# Auth Frontend: Login + Reset Password

Guia del modulo de autenticacion en frontend para no perder el flujo cuando el proyecto crece.

## Objetivo del modulo

Centralizar el acceso de usuarios con estos casos:

1. Iniciar sesion.
2. Crear cuenta (self-signup).
3. Solicitar recupero de contrasena.
4. Restablecer contrasena con token.

## Archivos clave

- `src/pages/Login.tsx`: UI y logica de login, registro y forgot-password.
- `src/pages/ResetPassword.tsx`: UI y logica de reset por token.
- `src/services/api.ts`: llamadas `authApi` (`login`, `register`, `forgotPassword`, `resetPassword`).
- `src/contexts/AuthContext.tsx`: persistencia de sesion (`token`, `user`) para login/registro.
- `src/App.tsx`: rutas publicas `/login` y `/reset-password`.

## Rutas del frontend

- `/login`
  - modo `login`
  - modo `register`
  - modo `forgot`
- `/reset-password?token=TOKEN`
  - formulario de nueva contrasena

## Endpoints backend usados

Base URL desde `VITE_API_URL` (fallback local actual: `http://localhost:3001/api`).

Prefijo auth: `/auth`

1. `POST /auth/login`
2. `POST /auth/register`
3. `POST /auth/forgot-password`
4. `POST /auth/reset-password`

## Contrato de respuesta esperado

Success:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": "mensaje de error"
}
```

## Flujo 1: Login

1. Usuario abre `/login`.
2. Completa email + contrasena.
3. Front normaliza:
   - `email.trim().toLowerCase()`
   - `password.trim()`
4. Front llama `authApi.login`.
5. `AuthContext` guarda `token` y usuario en `localStorage`.
6. Redireccion a `/dashboard`.

## Flujo 2: Registro

1. Usuario cambia a modo registro en `/login`.
2. Completa nombre, email y contrasena.
3. Front normaliza campos.
4. Front envia:
   - `name`
   - `email`
   - `password`
   - `clientName` (igual a nombre)
   - `role: "agent"` (default de self-signup)
5. Front llama `authApi.register`.
6. `AuthContext` guarda sesion.
7. Redireccion a `/dashboard`.

## Flujo 3: Forgot Password

1. Usuario hace click en `Olvide mi contrasena` desde `/login`.
2. Se muestra formulario solo con email (modo `forgot`).
3. Front normaliza email y llama `POST /auth/forgot-password`.
4. Front muestra siempre mensaje neutral:
   - `Revisa tu correo si la cuenta existe.`

Regla importante:

- Nunca mostrar si el email existe o no existe.

## Flujo 4: Reset Password

1. Usuario abre link del correo:
   - `/reset-password?token=...`
2. Front toma `token` desde query string.
3. Usuario ingresa nueva contrasena + confirmacion.
4. Validaciones frontend:
   - token presente
   - minimo 6 caracteres
   - confirmacion coincide
5. Front llama `POST /auth/reset-password` con:
   - `token`
   - `newPassword`
6. Si OK:
   - redireccion a `/login?reset=success`
   - login muestra mensaje: `Contrasena actualizada. Inicia sesion con tu nueva contrasena.`

## Mensajes UX actuales

- Forgot password exitoso:
  - `Revisa tu correo si la cuenta existe.`
- Reset password exitoso (en login):
  - `Contrasena actualizada. Inicia sesion con tu nueva contrasena.`
- Errores:
  - Se mapean con `getApiErrorMessage`.

## Estados internos relevantes

`Login.tsx`:

- `mode`: `login | register | forgot`
- `error`, `info`, `isLoading`
- `showPassword`

`ResetPassword.tsx`:

- `newPassword`, `confirmPassword`
- `error`, `isLoading`
- `showPassword`, `showConfirmPassword`

## QA checklist rapido

1. Login normal sigue funcionando.
2. Registro sigue funcionando.
3. Forgot password responde y muestra mensaje neutral.
4. Link con token abre `/reset-password`.
5. Reset con token valido permite loguear con nueva contrasena.
6. Reusar token devuelve error (`Invalid or expired token`).
7. Token ausente o invalido muestra error controlado.

## Notas de mantenimiento

- Este modulo es publico (no usa `ProtectedRoute`).
- Si cambia la API base (`VITE_API_URL`), validar que auth siga apuntando a `/api`.
- Cualquier cambio de textos UX debe mantener el mensaje neutral en forgot-password.

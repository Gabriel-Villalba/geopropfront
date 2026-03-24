# GeoProp Front

Frontend de la plataforma SaaS inmobiliaria multi-cliente **GeoProp**.

## Stack

- React 18
- TypeScript (strict)
- Vite
- TailwindCSS
- Context API (`AuthContext`)
- Axios para consumo de API (`src/services/api.ts`)
- Vitest + Testing Library (tests)

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear/usar `.env` en la raiz:

```env
VITE_API_URL="https://backproperties.onrender.com/api"
```

## Scripts

- `npm run dev`: servidor local
- `npm run build`: build de produccion
- `npm run preview`: preview del build
- `npm run lint`: lint
- `npm run typecheck`: chequeo de tipos TS
- `npm test`: ejecuta tests una vez
- `npm run test:watch`: tests en modo watch

## Despliegue en Vercel

Configuracion recomendada:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Variable de entorno: `VITE_API_URL` (ejemplo: `https://backproperties.onrender.com/api`)

Si usas rutas de `react-router-dom`, el repo incluye `vercel.json` con rewrite para servir `index.html` en rutas profundas.

## Estructura principal

```text
src/
  components/
  contexts/
  hooks/
  pages/
  services/
  test/
  types/
```

## Modulos principales

### Autenticacion

- `src/contexts/AuthContext.tsx`
- Mantiene usuario/token en `localStorage`.
- Login/Register reales contra backend (`POST /auth/login`, `POST /auth/register`).
- Sincroniza perfil autenticado con `GET /me` al iniciar sesion y al boot de la app.

### API centralizada

- `src/services/api.ts`
- Configura `baseURL`, timeout e interceptor JWT.
- Expone servicios por dominio (`authApi`, `meApi`, `propertyApi`, `alertApi`) y la instancia `api`.
- Normaliza errores de negocio y mapeos backend->UI en `src/services/backend.ts`.
- Incluye integracion de listings pagos:
  - `propertyApi.getMyPropertiesExtended()` -> `GET /properties/my`
  - `propertyApi.renewProperty()` -> `POST /properties/:id/renew`
  - `propertyApi.createPaymentPreference()` -> `POST /payments/create-preference`

### Panel propietario

- `src/pages/panel/PanelDashboard.tsx`
- `src/pages/panel/properties/MyPropertiesPage.tsx`
- `src/pages/panel/properties/create`
- `src/pages/panel/properties/edit`
- `src/hooks/useOwnerPanel.ts`
- Detalle completo en `README-propiedades.md`.

### Listings pagos (nuevo)

- Carpeta: `src/features/listings`
- Componentes:
  - `ListingPlanSelector.tsx`: selector reutilizable de tipo/duracion.
  - `RenewListingModal.tsx`: modal de renovacion con CTA de pago para featured.
  - `ExpiringPropertiesAlert.tsx`: alerta de publicaciones por vencer (`daysLeft <= 3`).
  - `FeaturedBadge.tsx`: badge visual para publicaciones destacadas.
- Integraciones:
  - `src/pages/panel/properties/MyPropertiesPage.tsx` usa alerta de vencimientos + modal de renovacion.
  - `src/components/PropertyCard.tsx` muestra badge destacado cuando `property.listing.isFeatured === true`.

### Panel de usuarios (admin)

- `src/pages/UserManagement.tsx`
- `src/hooks/useUsers.ts`
- Ruta: `/users`
- Solo admin puede acceder; no-admin es redirigido a `/dashboard`.
- Incluye:
  - Vista mobile (cards) y desktop (tabla)
  - Crear usuario
  - Editar usuario (permite resetear contrasena opcional)
  - Override de plan (heredar del cliente o definir `FREE/INMOBILIARIA/BROKER`)
  - Vencimiento de plan + `subscriptionStatus`
  - Activar/desactivar con confirmacion (`DELETE /users/:id` + `PUT /users/:id`)
  - Badges por rol
  - Toast simple de exito/error
  - Planes soportados por backend: `FREE`, `INMOBILIARIA`, `BROKER`
  - Guia detallada: `README-create-usuario.md`

## Endpoints usados por frontend

Auth:

- `POST /auth/login`
- `POST /auth/register`

> **Nota**: el frontend manda el email en minúsculas, elimina espacios alrededor del
> nombre/contraseña y, en el caso de auto‑registro, anexamos el campo `role: "agent"`
> y un `clientName` igual al `name`. La normalización se realiza en
> `src/services/api.ts` para evitar discrepancias con el backend.

- `GET /me`

Busqueda publica:

- `GET /search`

Propietario:

- `GET /me/properties`
- `GET /properties`
- `GET /properties/my`
- `POST /properties`
- `PUT /properties/:id`
- `POST /properties/:id/renew`
- `PATCH /properties/:id/activate`
- `PATCH /properties/:id/deactivate`
- `PATCH /properties/:id/approve` (admin)
- `DELETE /properties/:id`
- `POST /payments/create-preference`
- `GET /alerts`
- `POST /alerts`
- `PATCH /alerts/:id/deactivate`

Usuarios (admin):

- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /roles`
- `GET /clients/me`

## Testing

Configurado con Vitest + jsdom:

- Setup: `src/test/setup.ts`
- Hook tests: `src/hooks/useUsers.test.ts`
- UI tests: `src/pages/UserManagement.test.tsx`

Ejecutar:

```bash
npm test
```

## Rutas actuales

- `/login`
- `/dashboard`
- `/panel`
- `/panel/profile`
- `/panel/properties`
- `/panel/properties/create`
- `/panel/properties/:id/edit`
- `/panel/alerts`
- `/users` (protegida + rol admin)

## Notas

- Si el usuario autenticado no trae `role` o `roleId = "admin"`, no podra entrar a `/users`.
- El frontend espera backend con JWT en `Authorization: Bearer <token>`.
- El formulario de propietario carga ciudades via `GET /locations/cities` (por ahora solo Santa Fe).
- El orden de listados publicos no se altera en frontend; se respeta el orden entregado por backend (`isFeatured DESC`, `createdAt DESC`).

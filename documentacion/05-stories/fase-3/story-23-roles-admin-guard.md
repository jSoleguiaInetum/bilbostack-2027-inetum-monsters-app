# Story 23 — Roles y guard de administración

**Estado:** ✅ implementada

## Objetivo

Introducir roles de usuario en el modelo de dominio y proteger el futuro panel de administración para que solo pueda acceder el rol Administrador.

## Dependencias

- Auth mock (`AuthProvider`, `AuthRepository`).
- Capa `src/data` con adaptadores `local`/`api`.
- Épica 11 (Dashboard privado). Prepara el terreno para la story 24.

## Modelo de roles

```typescript
export type UserRole = 'participant' | 'admin'
```

`User` incorpora `role: UserRole`.

Helpers en `src/auth/roles.ts`:

- `USER_ROLES`: metadatos (nombre y descripción) de cada rol.
- `isAdminRole(role)`: `true` para `admin`.
- `isKnownRole(value)`: valida strings que llegan de fuera.
- `roleInfo(role)`: devuelve los metadatos de un rol.

## Reglas

- Los registros nuevos (`signUpWithEmail`) crean `participant`.
- En modo `local`, el primer usuario registrado recibe `admin` para poder entrar al panel sin backend. El resto son `participant`.
- Las sesiones y usuarios antiguos sin `role` se normalizan a `participant` al leerlos.
- En modo `api`, el rol lo decide el backend; si el DTO no trae rol o trae uno desconocido, se mapea a `participant`.

## Guard

`AdminRoute` (en `src/auth/AdminRoute.tsx`):

- `loading` → estado de carga.
- Sin sesión → redirige a `/login`.
- Rol no administrador → redirige a `/my-monster`.
- `admin` → renderiza el contenido.

## UI

- Ruta protegida `/admin` con una página esqueleto (`AdminPage`) que muestra el rol actual y los módulos previstos: usuarios/roles, logros/objetos y estadísticas.
- Enlace "Admin" en la cabecera de Mi Criatura, visible solo para roles administradores.
- El contenido funcional del panel llega en la story 24.

## Archivos

- `src/auth/types.ts` — `UserRole` y `User.role`.
- `src/auth/roles.ts` — metadatos y helpers de rol.
- `src/auth/AdminRoute.tsx` — guard de administración.
- `src/auth/AdminRoute.test.tsx` — tests de redirección y acceso.
- `src/auth/roles.test.ts` — tests de helpers.
- `src/data/local/auth-repository.ts` — bootstrap de admin, normalización de usuarios/sesión.
- `src/data/api/dto.ts` — `UserDto.role` y mapeo defensivo.
- `src/data/types.ts` — reexportación de `UserRole`.
- `src/pages/AdminPage.tsx` — esqueleto del panel.
- `src/pages/MyMonsterPage.tsx` — enlace Admin condicional.
- `src/App.tsx` — ruta `/admin` con `AdminRoute`.
- `src/data/local/local-repositories.test.ts` — bootstrap y normalización.
- `src/data/api/api-repositories.test.ts` — mapeo del rol.

## Criterios de aceptación

- [x] Existe un modelo de roles alineado con el dominio (Participante, Administrador).
- [x] Solo `admin` puede acceder al panel (F-60).
- [x] Sin sesión se redirige a login; con rol participante se redirige a Mi Criatura.
- [x] El rol se persiste en modo `local` y se mapea desde `api`.
- [x] Usuarios y sesiones antiguos sin rol se normalizan a `participant`.
- [x] El primer usuario local es admin para permitir probar el panel.
- [x] `lint`, `tsc` y la suite pasan.

## Fuera de alcance

- Contenido del dashboard privado: listado de usuarios, asignación de roles, CRUD y estadísticas (story 24).
- Endurecimiento server-side de los endpoints admin (S-04); en modo `api` lo aplica el backend.
- Generación de QR de administración (E11-06).

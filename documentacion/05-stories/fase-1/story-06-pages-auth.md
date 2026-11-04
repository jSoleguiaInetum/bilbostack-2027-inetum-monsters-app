# Story 06 — Páginas de Login y Registro

## Objetivo
Implementar LoginPage (email/pass + botones OAuth) y RegisterPage (formulario + selección de arquetipo).

## Dependencias
- Story 05 (AuthProvider, useAuth)
- Story 02 (ARCHETYPES constant)

## Archivos a crear

### `src/components/ArchetypeSelector.tsx`

Grid de 8 tarjetas para seleccionar arquetipo. Solo uno seleccionable a la vez.

**Props:**
```typescript
interface ArchetypeSelectorProps {
  selected: Archetype | null
  onSelect: (archetype: Archetype) => void
}
```

**Comportamiento:**
- Muestra las 8 opciones de `ARCHETYPES` en un grid 2×4 (mobile) o 4×2 (desktop)
- Cada tarjeta muestra: emoji icon + nombre + descripción corta
- La tarjeta seleccionada tiene borde `secondary` (#E20074) y fondo ligeramente diferente
- Las no seleccionadas tienen borde `primary` (#232D4B)
- Click en una tarjeta llama `onSelect(archetype.key)`

**Estilos (Tailwind):**
- Container: `grid grid-cols-2 md:grid-cols-4 gap-3`
- Tarjeta base: `p-4 rounded-lg border-2 border-primary bg-surface cursor-pointer transition-all`
- Tarjeta seleccionada: `border-secondary bg-secondary/10`
- Hover: `hover:border-secondary/50`
- Icon: `text-2xl mb-1`
- Nombre: `text-sm font-bold text-white`
- Descripción: `text-xs text-tech mt-1`

### `src/pages/LoginPage.tsx`

**Layout:**
- Centrado vertical y horizontal, max-width 400px
- Logo/título "BilboStack 2027" arriba (texto con gradiente como en preview-archetypes.html)
- Formulario: email input + password input + botón "Entrar"
- Separador "o continúa con"
- Botones OAuth: "Google" + "LinkedIn" (y eventualmente otros)
- Link "¿No tienes cuenta? Regístrate" → `/register`

**Comportamiento:**
- Submit llama `signInWithEmail(email, password)`
- Botón Google llama `signInWithOAuth('google')`
- Botón LinkedIn llama `signInWithOAuth('linkedin')`
- Error se muestra debajo del formulario en rojo
- Al hacer login exitoso, redirige a `/my-monster`
- Si ya está autenticado, redirige a `/my-monster`

**Estilos de inputs (Tailwind):**
- Input: `w-full bg-surface border-2 border-primary rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-secondary focus:outline-none`
- Botón principal: `w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-secondary/80 transition-colors`
- Botones OAuth: `w-full border-2 border-primary text-white py-3 rounded-lg hover:border-tech transition-colors flex items-center justify-center gap-2`
- Separador: línea con texto "o" centrado
- Error: `text-secondary text-sm mt-2`

### `src/pages/RegisterPage.tsx`

**Layout (2 pasos en la misma página):**

**Paso 1** — Datos de cuenta:
- Título "Crea tu cuenta"
- Inputs: nombre, email, password, confirmar password
- Botón "Siguiente" (valida y pasa a paso 2)

**Paso 2** — Selección de arquetipo:
- Título "Elige tu arquetipo"
- Subtítulo "Define tu identidad profesional. Tu criatura reflejará tu rol."
- Componente `ArchetypeSelector`
- Botón "Crear mi criatura" (disabled hasta que se seleccione arquetipo)
- Link "Volver" para volver al paso 1

**Comportamiento:**
- Estado local: `step` (1 o 2), `name`, `email`, `password`, `confirmPassword`, `archetype`, `error`
- Paso 1 → Paso 2: valida que password === confirmPassword, email no vacío, nombre no vacío
- Paso 2 → Submit: llama `signUpWithEmail(email, password, name, archetype)`
- Error se muestra en rojo
- Al registro exitoso, redirige a `/my-monster`
- Link "¿Ya tienes cuenta? Inicia sesión" → `/login`

**Validaciones (paso 1):**
- Nombre: mínimo 2 caracteres
- Email: formato email básico (includes @ y .)
- Password: mínimo 6 caracteres
- Confirmar password: debe coincidir con password

### Actualizar `src/App.tsx`

Reemplazar los placeholders de LoginPage y RegisterPage con imports de los archivos reales:

```tsx
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
```

## Criterios de aceptación

- [ ] LoginPage muestra formulario email/password + botones Google y LinkedIn
- [ ] Login con email funciona (mock: cualquier password vale para usuario existente)
- [ ] Botones OAuth crean usuario mock y redirigen a `/my-monster`
- [ ] Link a registro funciona
- [ ] RegisterPage tiene 2 pasos: datos + arquetipo
- [ ] Validaciones de paso 1 funcionan (nombre, email, password, confirmación)
- [ ] ArchetypeSelector muestra los 8 arquetipos con selección visual
- [ ] Registro crea usuario y redirige a `/my-monster`
- [ ] Errores se muestran en rojo (email duplicado, campos vacíos)
- [ ] Si ya está autenticado, las páginas de login/register redirigen a `/my-monster`
- [ ] Responsive: funciona en 375px

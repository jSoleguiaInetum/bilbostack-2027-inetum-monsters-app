# Story 09 — Página post-scan (tarjeta del otro usuario)

## Objetivo
Al escanear un QR, mostrar la tarjeta del usuario escaneado con su monstruo, y ofrecer acciones: "Conectar" (funcional) y "Pelear" (coming soon).

## Dependencias
- Story 04 (MonsterCard, RarityBadge)
- Story 03 (generateMonster)
- Story 05 (useAuth — getUserById)
- Story 07 (qr-codec)

## Archivos a crear

### `src/lib/contacts.ts`

Almacena contactos en localStorage hasta que haya backend.

```typescript
interface Contact {
  userId: string
  name: string
  email: string
  archetype: string
  connectedAt: string
}

const CONTACTS_KEY = 'bilbostack_contacts'

export function getContacts(currentUserId: string): Contact[] {
  const data = localStorage.getItem(`${CONTACTS_KEY}_${currentUserId}`)
  return data ? JSON.parse(data) : []
}

export function addContact(currentUserId: string, contact: Omit<Contact, 'connectedAt'>): boolean {
  const contacts = getContacts(currentUserId)
  if (contacts.find(c => c.userId === contact.userId)) return false // ya conectado
  contacts.push({ ...contact, connectedAt: new Date().toISOString() })
  localStorage.setItem(`${CONTACTS_KEY}_${currentUserId}`, JSON.stringify(contacts))
  return true
}

export function isContact(currentUserId: string, targetUserId: string): boolean {
  return getContacts(currentUserId).some(c => c.userId === targetUserId)
}
```

### `src/pages/UserCardPage.tsx`

**Cómo recibe los datos:**
- La ruta es `/user/:id`
- Opción A: el payload del QR se pasa via state del navigate: `navigate('/user/xxx', { state: { payload } })`
- Opción B: se busca el usuario por ID en el mock auth
- Usar **ambas**: primero intenta leer del state (datos del QR), fallback a `getUserById(id)`
- Si no se encuentra el usuario por ningún medio → mostrar "Usuario no encontrado"

**Layout:**
- Header: "Jugador encontrado" + botón "Volver" → `/scan` o `/my-monster`
- Centro: MonsterCard del otro usuario (tamaño 240px)
- Debajo: nombre + arquetipo + RarityBadge del otro
- 2 botones de acción:
  - "Conectar" — verde, funcional
  - "Pelear" — magenta, deshabilitado con badge "Próximamente"

**Comportamiento del botón "Conectar":**
- Si ya es contacto → botón cambia a "Ya conectado" (disabled, texto gris)
- Si no es contacto → click guarda contacto con `addContact()` → feedback visual (animación check ✓ + texto cambia a "Conectado!") → botón se deshabilita
- Feedback: transición de "Conectar" → "✓ Conectado!" con cambio de color

**Comportamiento del botón "Pelear":**
- Siempre visible pero deshabilitado
- Estilo: opacity reducida + cursor not-allowed
- Badge/tooltip: "Próximamente" en un chip accent

**Generación del monstruo del otro:**
- El payload del QR contiene `email` → `generateMonster(email)` para obtener params
- El payload contiene `archetype` → para el badge

### Actualizar `src/pages/ScanPage.tsx`

Al detectar QR válido, navegar pasando el payload en el state:

```typescript
navigate(`/user/${payload.userId}`, { state: { payload } })
```

### Actualizar `src/App.tsx`

```tsx
import { UserCardPage } from './pages/UserCardPage'
```

## Criterios de aceptación

- [ ] Al escanear QR, se muestra la tarjeta del otro usuario con su monstruo
- [ ] El monstruo del otro se genera a partir de su email (determinista)
- [ ] Se muestra nombre, arquetipo y rareza del otro
- [ ] Botón "Conectar" guarda contacto en localStorage
- [ ] Si ya es contacto, el botón muestra "Ya conectado" deshabilitado
- [ ] Feedback visual al conectar (transición de texto/color)
- [ ] Botón "Pelear" está visible pero deshabilitado con badge "Próximamente"
- [ ] Botón "Volver" navega a `/my-monster` o `/scan`
- [ ] Si el usuario no se encuentra, muestra "Usuario no encontrado"
- [ ] La página funciona tanto con datos del QR state como con getUserById fallback

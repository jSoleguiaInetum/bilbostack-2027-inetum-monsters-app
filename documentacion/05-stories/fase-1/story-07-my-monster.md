# Story 07 — Página Mi Monstruo + QR Display

## Objetivo
Pantalla principal del usuario autenticado: muestra su criatura, su info, y su QR personal.

## Dependencias
- Story 04 (MonsterCard, RarityBadge)
- Story 05 (useAuth)
- Story 03 (generateMonster)

## Archivos a crear

### `src/qr/qr-codec.ts`

Encode/decode del payload del QR. Usa JSON base64 para mantenerlo compacto.

```typescript
import type { QRPayload } from './types'

export function encodeQRPayload(payload: QRPayload): string {
  return btoa(JSON.stringify(payload))
}

export function decodeQRPayload(data: string): QRPayload | null {
  try {
    const decoded = JSON.parse(atob(data))
    if (decoded.type === 'person' && decoded.userId && decoded.name) {
      return decoded as QRPayload
    }
    return null
  } catch {
    return null
  }
}
```

### `src/qr/QRDisplay.tsx`

Genera y muestra el QR personal del usuario.

**Props:**
```typescript
interface QRDisplayProps {
  payload: QRPayload
  size?: number           // px, default 200
  className?: string
}
```

**Implementación:**
- Usa `qrcode` para generar data URL del QR
- El QR contiene el payload encoded con `encodeQRPayload`
- Estado: `qrDataUrl: string | null`
- useEffect que genera el QR al montar o cuando cambia el payload
- Muestra loading spinner mientras genera
- Al hacer click en el QR, lo muestra en pantalla completa (fullscreen overlay)

```typescript
import QRCode from 'qrcode'
// Generar:
const url = await QRCode.toDataURL(encodeQRPayload(payload), {
  width: size,
  margin: 2,
  color: { dark: '#232D4B', light: '#FFFFFF' },
})
```

**Fullscreen overlay:**
- Fondo semitransparente negro
- QR centrado en grande (80vmin)
- Click/tap cierra el overlay
- Texto "Toca para cerrar" debajo

### `src/pages/MyMonsterPage.tsx`

**Layout:**
- Header: "Mi Criatura" + botón signOut (esquina superior derecha)
- Centro: MonsterCard (tamaño 280px)
- Debajo del monstruo: nombre del usuario + arquetipo + RarityBadge
- Debajo: QR personal (tamaño 180px) con texto "Mi QR"
- Footer con 2 botones de acción:
  - "Mostrar QR" → abre QR en fullscreen
  - "Escanear" → navega a `/scan`

**Comportamiento:**
- useEffect: `generateMonster(user.email)` → guardar params en estado
- Mientras genera: skeleton/loading
- El QR contiene: `{ type: 'person', userId: user.id, name: user.name, email: user.email, archetype: user.archetype }`

**Layout (Tailwind):**
```
min-h-screen bg-background flex flex-col
  header: flex justify-between items-center px-6 py-4
  main: flex-1 flex flex-col items-center justify-center gap-6 px-6
    MonsterCard (280px)
    div: nombre (text-xl font-bold) + arquetipo (text-tech text-sm) + RarityBadge
    QRDisplay (180px)
  footer: flex gap-4 px-6 py-6
    btn "Mostrar QR": bg-primary border-2 border-tech
    btn "Escanear": bg-secondary
```

### Actualizar `src/App.tsx`

Reemplazar placeholder de MyMonsterPage:

```tsx
import { MyMonsterPage } from './pages/MyMonsterPage'
```

## Criterios de aceptación

- [ ] La página muestra el monstruo del usuario autenticado
- [ ] El monstruo es determinista: recargar la página muestra el mismo monstruo
- [ ] Se muestra nombre, arquetipo y rareza debajo del monstruo
- [ ] El QR se genera y se muestra debajo del monstruo
- [ ] Click en el QR (o botón "Mostrar QR") abre overlay fullscreen
- [ ] Click en el overlay cierra el fullscreen
- [ ] Botón "Escanear" navega a `/scan`
- [ ] Botón signOut cierra sesión y redirige a `/login`
- [ ] La página es responsive (375px+)
- [ ] Hay loading state mientras se generan el monstruo y el QR

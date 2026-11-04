# Story 02 — Tipos y constantes compartidas

## Objetivo
Definir todos los tipos TypeScript y constantes que usarán las demás stories.

## Archivos a crear

### `src/lib/constants.ts`

```typescript
export const ARCHETYPES = [
  { key: 'developer', name: 'Developer', icon: '⌨️', description: 'Código, algoritmos y sistemas' },
  { key: 'ux', name: 'UX / Design', icon: '🎨', description: 'Experiencia de usuario y diseño visual' },
  { key: 'devops', name: 'DevOps / Platform', icon: '⚙️', description: 'Infraestructura, CI/CD y cloud' },
  { key: 'qa', name: 'QA', icon: '🔍', description: 'Calidad, testing y automatización' },
  { key: 'product', name: 'Product', icon: '🧭', description: 'Producto, estrategia y roadmap' },
  { key: 'management', name: 'Management', icon: '👑', description: 'Gestión, liderazgo y organización' },
  { key: 'ia', name: 'IA Engineer', icon: '🧠', description: 'Inteligencia artificial y machine learning' },
  { key: 'multiclass', name: 'Multiclass', icon: '🔀', description: 'Perfil híbrido multidisciplinar' },
] as const

export const RARITIES = [
  { name: 'Inusual', threshold: 0.60, color: '#8BB9FE', bgColor: '#232D4B' },
  { name: 'Singular', threshold: 0.82, color: '#D76CFF', bgColor: '#2B1840' },
  { name: 'Único', threshold: 0.93, color: '#4DBF61', bgColor: '#1a3a1a' },
  { name: 'Épico', threshold: 0.98, color: '#F5F340', bgColor: '#3a2800' },
  { name: 'Legendario', threshold: 1.00, color: '#E20074', bgColor: '#3a0020' },
] as const

export const ASSET_COUNTS = {
  bodies: 16,
  eyes: 16,
  mouths: 16,
  accessories: 16,
  patterns: 16,
  auras: 16,
} as const

export const ASSETS_BASE_PATH = '/monster-assets'
```

### `src/monster/types.ts`

```typescript
export type Archetype = 
  | 'developer' | 'ux' | 'devops' | 'qa' 
  | 'product' | 'management' | 'ia' | 'multiclass'

export interface Rarity {
  name: string
  color: string
  bgColor: string
}

export interface MonsterParams {
  bodyShape: number    // 1-16
  eyesType: number     // 1-16
  mouthType: number    // 1-16
  accessory: number    // 1-16
  pattern: number      // 1-16
  auraEffect: number   // 1-16
  rarity: Rarity
}

export interface MonsterAssets {
  aura: string         // path al SVG de aura
  body: string         // path al SVG de body (incluye evo suffix)
  pattern: string      // path al SVG de pattern
  eyes: string         // path al SVG de eyes
  mouth: string        // path al SVG de mouth
  accessory: string    // path al SVG de accessory
  badge: string        // path al SVG de archetype badge
}

export type Evolution = 0 | 1 | 2 | 3
```

### `src/auth/types.ts`

```typescript
import type { Archetype } from '../monster/types'

export interface User {
  id: string
  email: string
  name: string
  archetype: Archetype
  createdAt: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, archetype: Archetype) => Promise<void>
  signOut: () => Promise<void>
}
```

### `src/qr/types.ts`

```typescript
export interface QRPayload {
  type: 'person'
  userId: string
  name: string
  email: string
  archetype: string
}
```

### `src/lib/crypto.ts`

```typescript
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
```

## Criterios de aceptación

- [ ] `npm run build` compila sin errores
- [ ] Los 8 arquetipos están definidos en ARCHETYPES
- [ ] Las 5 rarezas están definidas con umbrales acumulativos (0.60, 0.82, 0.93, 0.98, 1.00)
- [ ] Todos los tipos exportados son accesibles desde otros módulos
- [ ] `sha256('test')` devuelve un string hexadecimal de 64 caracteres

# Story 04 — Componente MonsterCard

## Objetivo
Componente React que renderiza un monstruo como stack de 7 capas SVG superpuestas.

## Dependencias
- Story 02 (tipos)
- Story 03 (getMonsterAssets)

## Archivos a crear

### `src/monster/MonsterCard.tsx`

Composición visual: 7 `<img>` absolutamente posicionados dentro de un contenedor relativo. Orden de z-index: aura (fondo) → body → pattern → eyes → mouth → accessory → badge (frente).

```tsx
import { getMonsterAssets } from './generator'
import type { MonsterParams, Archetype, Evolution } from './types'

interface MonsterCardProps {
  params: MonsterParams
  archetype: Archetype
  evolution?: Evolution
  size?: number          // px, default 256
  className?: string
}

const LAYERS = ['aura', 'body', 'pattern', 'eyes', 'mouth', 'accessory', 'badge'] as const

export function MonsterCard({ params, archetype, evolution = 0, size = 256, className = '' }: MonsterCardProps) {
  const assets = getMonsterAssets(params, archetype, evolution)

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {LAYERS.map((layer) => (
        <img
          key={layer}
          src={assets[layer]}
          alt={layer}
          className="absolute inset-0 w-full h-full"
          loading={layer === 'aura' ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  )
}
```

### `src/monster/RarityBadge.tsx`

Badge que muestra la rareza del monstruo.

```tsx
import type { Rarity } from './types'

interface RarityBadgeProps {
  rarity: Rarity
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: rarity.bgColor, color: rarity.color }}
    >
      {rarity.name}
    </span>
  )
}
```

### Verificación visual

Temporalmente, modificar `src/App.tsx` para probar el componente:

```tsx
import { useState, useEffect } from 'react'
import { MonsterCard } from './monster/MonsterCard'
import { RarityBadge } from './monster/RarityBadge'
import { generateMonster } from './monster/generator'
import type { MonsterParams } from './monster/types'

export default function App() {
  const [params, setParams] = useState<MonsterParams | null>(null)

  useEffect(() => {
    generateMonster('demo@bilbostack.dev').then(({ params }) => setParams(params))
  }, [])

  if (!params) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <MonsterCard params={params} archetype="developer" size={300} />
      <RarityBadge rarity={params.rarity} />
    </div>
  )
}
```

Abrir en el navegador: debe verse un monstruo compuesto con sus 7 capas apiladas y el badge de rareza debajo.

## Criterios de aceptación

- [ ] El monstruo se renderiza como stack de 7 capas SVG
- [ ] Las capas se superponen correctamente (aura detrás, badge delante)
- [ ] El prop `size` controla el tamaño del contenedor
- [ ] El prop `evolution` cambia el body a la variante evo correspondiente
- [ ] RarityBadge muestra el nombre de la rareza con colores correctos
- [ ] No hay errores en consola (SVGs cargan correctamente)
- [ ] Se puede usar con cualquier combinación de params + archetype

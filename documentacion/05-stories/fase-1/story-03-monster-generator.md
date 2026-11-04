# Story 03 — Monster Generator

## Objetivo
Implementar la lógica que convierte un email en parámetros de monstruo deterministas y devuelve las rutas a los assets SVG.

## Dependencias
- Story 02 (tipos y constantes)

## Archivos a crear

### `src/monster/generator.ts`

```typescript
import { sha256 } from '../lib/crypto'
import { RARITIES, ASSET_COUNTS, ASSETS_BASE_PATH } from '../lib/constants'
import type { Archetype, MonsterParams, MonsterAssets, Rarity, Evolution } from './types'

function hexToInt(hex: string, start: number, length: number): number {
  return parseInt(hex.substring(start, start + length), 16)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function getRarity(hash: string): Rarity {
  const score = hexToInt(hash, 24, 4) / 0xFFFF
  for (const rarity of RARITIES) {
    if (score <= rarity.threshold) {
      return { name: rarity.name, color: rarity.color, bgColor: rarity.bgColor }
    }
  }
  return { name: RARITIES[4].name, color: RARITIES[4].color, bgColor: RARITIES[4].bgColor }
}

export function extractParams(hash: string): MonsterParams {
  return {
    bodyShape:  (hexToInt(hash, 0, 4) % ASSET_COUNTS.bodies) + 1,
    eyesType:   (hexToInt(hash, 12, 2) % ASSET_COUNTS.eyes) + 1,
    mouthType:  (hexToInt(hash, 14, 2) % ASSET_COUNTS.mouths) + 1,
    accessory:  (hexToInt(hash, 16, 2) % ASSET_COUNTS.accessories) + 1,
    pattern:    (hexToInt(hash, 18, 2) % ASSET_COUNTS.patterns) + 1,
    auraEffect: (hexToInt(hash, 20, 2) % ASSET_COUNTS.auras) + 1,
    rarity:     getRarity(hash),
  }
}

export function getMonsterAssets(
  params: MonsterParams,
  archetype: Archetype,
  evolution: Evolution = 0
): MonsterAssets {
  const bodyNum = pad(params.bodyShape)
  const evoSuffix = evolution > 0 ? `-evo-${evolution}` : ''

  return {
    aura:      `${ASSETS_BASE_PATH}/aura-${pad(params.auraEffect)}.svg`,
    body:      `${ASSETS_BASE_PATH}/body-${bodyNum}${evoSuffix}.svg`,
    pattern:   `${ASSETS_BASE_PATH}/pattern-${pad(params.pattern)}.svg`,
    eyes:      `${ASSETS_BASE_PATH}/eyes-${pad(params.eyesType)}.svg`,
    mouth:     `${ASSETS_BASE_PATH}/mouth-${pad(params.mouthType)}.svg`,
    accessory: `${ASSETS_BASE_PATH}/acc-${pad(params.accessory)}.svg`,
    badge:     `${ASSETS_BASE_PATH}/arch-${archetype}.svg`,
  }
}

export async function generateMonster(email: string): Promise<{ hash: string; params: MonsterParams }> {
  const hash = await sha256(email.trim().toLowerCase())
  const params = extractParams(hash)
  return { hash, params }
}
```

## Verificación

Crear un test rápido en la consola del navegador o un archivo de test:

```typescript
// Verificar determinismo: mismo email = mismos params
const result1 = await generateMonster('demo@bilbostack.dev')
const result2 = await generateMonster('demo@bilbostack.dev')
console.assert(JSON.stringify(result1) === JSON.stringify(result2), 'Determinismo falla')

// Verificar que email diferente = params diferentes
const result3 = await generateMonster('otro@email.com')
console.assert(result1.hash !== result3.hash, 'Emails diferentes generan mismo hash')

// Verificar rangos
const { params } = result1
console.assert(params.bodyShape >= 1 && params.bodyShape <= 16, 'bodyShape fuera de rango')
console.assert(params.eyesType >= 1 && params.eyesType <= 16, 'eyesType fuera de rango')
console.assert(params.rarity.name !== undefined, 'Rarity no definida')

// Verificar assets
const assets = getMonsterAssets(params, 'developer', 0)
console.assert(assets.body.includes('body-'), 'Asset body mal formado')
console.assert(assets.badge.includes('arch-developer'), 'Asset badge mal formado')

// Verificar evoluciones
const assetsEvo3 = getMonsterAssets(params, 'developer', 3)
console.assert(assetsEvo3.body.includes('-evo-3'), 'Asset evo-3 no tiene suffix')
```

## Criterios de aceptación

- [ ] `generateMonster(email)` devuelve hash + params
- [ ] El mismo email siempre produce los mismos params (determinista)
- [ ] Emails diferentes producen params diferentes
- [ ] Todos los valores de params están en rango 1-16
- [ ] La rareza se calcula correctamente según los umbrales
- [ ] `getMonsterAssets()` devuelve paths válidos a SVGs existentes
- [ ] Evolution 0 no tiene suffix, evolution 1-3 tiene `-evo-X`
- [ ] El email se normaliza (trim + toLowerCase) antes de hashear

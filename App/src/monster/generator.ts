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

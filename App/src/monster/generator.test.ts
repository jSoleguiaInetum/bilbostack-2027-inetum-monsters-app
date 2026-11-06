import { describe, expect, it } from 'vitest'
import { generateMonster, getMonsterAssets } from './generator'
import { ASSET_COUNTS, ASSETS_BASE_PATH } from '../lib/constants'

describe('generator', () => {
  it('is deterministic for the same normalized email', async () => {
    const first = await generateMonster('Test@Example.com')
    const second = await generateMonster('  test@example.com  ')

    expect(first).toEqual(second)
  })

  it('generates different creatures for different emails', async () => {
    const first = await generateMonster('one@example.com')
    const second = await generateMonster('two@example.com')

    expect(first.hash).not.toBe(second.hash)
  })

  it('keeps generated params inside the asset ranges', async () => {
    const { params } = await generateMonster('bounds@example.com')

    expect(params.bodyShape).toBeGreaterThanOrEqual(1)
    expect(params.bodyShape).toBeLessThanOrEqual(ASSET_COUNTS.bodies)
    expect(params.eyesType).toBeGreaterThanOrEqual(1)
    expect(params.eyesType).toBeLessThanOrEqual(ASSET_COUNTS.eyes)
    expect(params.mouthType).toBeGreaterThanOrEqual(1)
    expect(params.mouthType).toBeLessThanOrEqual(ASSET_COUNTS.mouths)
    expect(params.accessory).toBeGreaterThanOrEqual(1)
    expect(params.accessory).toBeLessThanOrEqual(ASSET_COUNTS.accessories)
    expect(params.pattern).toBeGreaterThanOrEqual(1)
    expect(params.pattern).toBeLessThanOrEqual(ASSET_COUNTS.patterns)
    expect(params.auraEffect).toBeGreaterThanOrEqual(1)
    expect(params.auraEffect).toBeLessThanOrEqual(ASSET_COUNTS.auras)
  })

  it('builds evolution-aware asset paths', async () => {
    const { params } = await generateMonster('assets@example.com')
    const assets = getMonsterAssets(params, 'developer', 2)

    expect(assets.body).toContain('-evo-2.svg')
    expect(assets.badge).toBe(`${ASSETS_BASE_PATH}/arch-developer.svg`)
    expect(assets.aura).toMatch(/aura-\d{2}\.svg$/)
  })
})

import { describe, expect, it } from 'vitest'
import { applyReward, createInitialMetrics, emptyMetrics } from './metrics'

describe('metrics', () => {
  it('creates initial metrics with the rarity aura bonus', () => {
    const metrics = createInitialMetrics('Épico')

    expect(metrics.expertise).toBe(1)
    expect(metrics.auraTech).toBe(5)
    expect(metrics.history).toHaveLength(1)
    expect(metrics.history[0].action).toBe('register')
  })

  it('returns empty metrics when there is no history', () => {
    expect(emptyMetrics()).toEqual({ expertise: 0, auraTech: 0, history: [] })
  })

  it('adds the diverse contact bonus when archetypes differ', () => {
    const initial = { expertise: 1, auraTech: 5, history: [] }

    const updated = applyReward(initial, 'contact_add', 'ux', 'developer')

    expect(updated.expertise).toBe(1)
    expect(updated.auraTech).toBe(10)
    expect(updated.history).toHaveLength(1)
    expect(updated.history[0]).toMatchObject({ action: 'contact_add', expertise: 0, auraTech: 5 })
  })

  it('does not mutate the original metrics', () => {
    const initial = { expertise: 1, auraTech: 1, history: [] }

    applyReward(initial, 'battle_win')

    expect(initial).toEqual({ expertise: 1, auraTech: 1, history: [] })
  })
})

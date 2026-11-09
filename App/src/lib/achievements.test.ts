import { describe, expect, it } from 'vitest'
import { evaluateAchievements } from './achievements'
import type { Achievement, AchievementContext } from './achievements'

function context(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    userId: 'user-1',
    metrics: { expertise: 0, auraTech: 0, history: [] },
    contactCount: 0,
    battleCount: 0,
    battleWins: 0,
    uniqueArchetypesContacted: 0,
    ...overrides,
  }
}

describe('achievements', () => {
  it('unlocks achievements whose condition is met', () => {
    const result = evaluateAchievements([], context({ contactCount: 1 }))

    expect(result.newlyUnlocked.map(achievement => achievement.id)).toEqual(['first-contact'])
    expect(result.unlocked).toHaveLength(1)
  })

  it('does not unlock the same achievement twice', () => {
    const first = evaluateAchievements([], context({ contactCount: 1 }))
    const second = evaluateAchievements(first.unlocked, context({ contactCount: 1 }))

    expect(second.newlyUnlocked).toEqual([])
    expect(second.unlocked).toHaveLength(1)
  })

  it('includes the reward object configured in the definition', () => {
    const definitions: Achievement[] = [{
      id: 'object-reward',
      name: 'Objeto',
      description: 'Entrega un objeto',
      icon: '📦',
      hidden: false,
      objectId: 'object-01',
      condition: () => true,
    }]

    const result = evaluateAchievements([], context(), definitions)

    expect(result.newlyUnlocked[0]).toMatchObject({
      id: 'object-reward',
      objectId: 'object-01',
    })
    expect(result.unlocked[0]).toMatchObject({ id: 'object-reward' })
  })

  it('evaluates multiple achievements in one pass', () => {
    const result = evaluateAchievements([], context({
      contactCount: 15,
      uniqueArchetypesContacted: 8,
      battleCount: 10,
      battleWins: 5,
      metrics: { expertise: 50, auraTech: 50, history: [] },
    }))

    const ids = result.newlyUnlocked.map(achievement => achievement.id)
    expect(ids).toContain('first-contact')
    expect(ids).toContain('networker')
    expect(ids).toContain('social-butterfly')
    expect(ids).toContain('first-blood')
    expect(ids).toContain('gladiator')
    expect(ids).toContain('battle-veteran')
    expect(ids).toContain('diverse-network')
    expect(ids).toContain('all-archetypes')
    expect(ids).toContain('expert')
    expect(ids).toContain('aura-master')
    expect(ids).toContain('evolved')
  })
})

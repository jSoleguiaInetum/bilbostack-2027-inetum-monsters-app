import { describe, expect, it } from 'vitest'
import {
  evaluateMissionProgress,
  missionProgressValue,
  type Mission,
  type MissionContext,
} from './missions'

function context(overrides: Partial<MissionContext> = {}): MissionContext {
  return {
    metrics: { expertise: 0, auraTech: 0, history: [] },
    contactCount: 0,
    battleCount: 0,
    battleWins: 0,
    talkCount: 0,
    uniqueArchetypesContacted: 0,
    achievementCount: 0,
    ...overrides,
  }
}

describe('missions', () => {
  it('computes the progress value of every objective type', () => {
    const ctx = context({
      metrics: { expertise: 12, auraTech: 9, history: [] },
      contactCount: 4,
      battleCount: 3,
      battleWins: 2,
      talkCount: 1,
      uniqueArchetypesContacted: 3,
      achievementCount: 2,
    })

    expect(missionProgressValue({ type: 'contacts', target: 5 }, ctx)).toBe(4)
    expect(missionProgressValue({ type: 'battles', target: 5 }, ctx)).toBe(3)
    expect(missionProgressValue({ type: 'battle_wins', target: 5 }, ctx)).toBe(2)
    expect(missionProgressValue({ type: 'talks', target: 5 }, ctx)).toBe(1)
    expect(missionProgressValue({ type: 'archetypes', target: 5 }, ctx)).toBe(3)
    expect(missionProgressValue({ type: 'achievements', target: 5 }, ctx)).toBe(2)
    expect(missionProgressValue({ type: 'expertise', target: 20 }, ctx)).toBe(12)
    expect(missionProgressValue({ type: 'aura', target: 20 }, ctx)).toBe(9)
  })

  it('marks active missions with partial progress', () => {
    const progress = evaluateMissionProgress([], context({ contactCount: 2 }))

    expect(progress.find(entry => entry.mission.id === 'mission-first-contact')).toMatchObject({
      status: 'active',
      current: 2,
      target: 1,
    })

    const contacts = progress.find(entry => entry.mission.id === 'mission-network-3')
    expect(contacts).toMatchObject({ status: 'active', current: 2, target: 3 })
  })

  it('keeps the completion timestamp of completed missions', () => {
    const progress = evaluateMissionProgress(
      [{ missionId: 'mission-first-contact', completedAt: '2026-01-01T10:00:00.000Z' }],
      context({ contactCount: 5 }),
    )

    const completed = progress.find(entry => entry.mission.id === 'mission-first-contact')

    expect(completed).toMatchObject({
      status: 'completed',
      completedAt: '2026-01-01T10:00:00.000Z',
    })
  })

  it('excludes inactive missions unless they were already completed', () => {
    const defs: Mission[] = [{
      id: 'mission-inactive',
      name: 'Inactiva',
      description: 'No debería mostrarse',
      type: 'base',
      objective: { type: 'contacts', target: 1 },
      reward: { expertise: 0, auraTech: 0 },
      isActive: false,
    }]

    expect(evaluateMissionProgress([], context({ contactCount: 1 }), defs)).toEqual([])

    const progress = evaluateMissionProgress(
      [{ missionId: 'mission-inactive', completedAt: '2026-01-01T10:00:00.000Z' }],
      context({ contactCount: 1 }),
      defs,
    )

    expect(progress).toHaveLength(1)
    expect(progress[0].status).toBe('completed')
  })
})

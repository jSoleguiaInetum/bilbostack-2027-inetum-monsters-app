import { describe, expect, it } from 'vitest'
import { getEvolutionStage, getNextEvolution } from './evolution'
import type { PlayerMetrics } from './metrics'

function metrics(expertise: number, auraTech: number): PlayerMetrics {
  return { expertise, auraTech, history: [] }
}

describe('evolution', () => {
  it.each([
    [0, 0],
    [19, 0],
    [20, 1],
    [59, 1],
    [60, 2],
    [119, 2],
    [120, 3],
    [500, 3],
  ])('maps total %i to stage %i', (total, expectedStage) => {
    expect(getEvolutionStage(metrics(total, 0))).toBe(expectedStage)
  })

  it('calculates progress towards the next evolution', () => {
    const next = getNextEvolution(metrics(10, 0))

    expect(next?.threshold.stage).toBe(1)
    expect(next?.progress).toBe(0.5)
  })

  it('returns null at the maximum evolution', () => {
    expect(getNextEvolution(metrics(120, 0))).toBeNull()
  })
})

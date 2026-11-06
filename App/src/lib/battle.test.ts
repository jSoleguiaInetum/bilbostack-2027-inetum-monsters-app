import { describe, expect, it } from 'vitest'
import { resolveBattle, resolveRound } from './battle'

describe('battle', () => {
  it('awards the round to the only correct player', () => {
    expect(resolveRound(true, 5000, false, 1000).winner).toBe('player')
    expect(resolveRound(false, 1000, true, 5000).winner).toBe('opponent')
  })

  it('uses response time when both are correct', () => {
    expect(resolveRound(true, 1000, true, 2000).winner).toBe('player')
    expect(resolveRound(true, 3000, true, 2000).winner).toBe('opponent')
    expect(resolveRound(true, 2000, true, 2000).winner).toBe('draw')
  })

  it('draws when both are wrong', () => {
    expect(resolveRound(false, 1000, false, 2000).winner).toBe('draw')
  })

  it('resolves the battle by round wins', () => {
    const playerWins = [
      resolveRound(true, 1000, false, 2000),
      resolveRound(true, 1000, false, 2000),
      resolveRound(false, 1000, true, 2000),
    ]
    const opponentWins = [
      resolveRound(false, 1000, true, 2000),
      resolveRound(false, 1000, true, 2000),
      resolveRound(true, 1000, false, 2000),
    ]
    const draw = [
      resolveRound(true, 1000, false, 2000),
      resolveRound(false, 1000, true, 2000),
      resolveRound(false, 1000, false, 2000),
    ]

    expect(resolveBattle(playerWins)).toBe('win')
    expect(resolveBattle(opponentWins)).toBe('loss')
    expect(resolveBattle(draw)).toBe('draw')
  })
})

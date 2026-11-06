import type { Archetype } from '../monster/types'

export interface RoundResult {
  playerCorrect: boolean
  playerTimeMs: number
  opponentCorrect: boolean
  opponentTimeMs: number
  winner: 'player' | 'opponent' | 'draw'
}

export interface BattleResult {
  id: string
  opponentId: string
  opponentName: string
  opponentArchetype: Archetype
  rounds: RoundResult[]
  outcome: 'win' | 'loss' | 'draw'
  timestamp: string
}

export function resolveRound(
  playerCorrect: boolean,
  playerTimeMs: number,
  opponentCorrect: boolean,
  opponentTimeMs: number,
): RoundResult {
  let winner: 'player' | 'opponent' | 'draw'
  if (playerCorrect && !opponentCorrect) winner = 'player'
  else if (!playerCorrect && opponentCorrect) winner = 'opponent'
  else if (playerCorrect && opponentCorrect) {
    winner = playerTimeMs < opponentTimeMs ? 'player' : playerTimeMs > opponentTimeMs ? 'opponent' : 'draw'
  } else {
    winner = 'draw'
  }
  return { playerCorrect, playerTimeMs, opponentCorrect, opponentTimeMs, winner }
}

export function resolveBattle(rounds: RoundResult[]): 'win' | 'loss' | 'draw' {
  let playerWins = 0
  let opponentWins = 0
  for (const r of rounds) {
    if (r.winner === 'player') playerWins++
    else if (r.winner === 'opponent') opponentWins++
  }
  if (playerWins > opponentWins) return 'win'
  if (opponentWins > playerWins) return 'loss'
  return 'draw'
}

export function simulateOpponentAnswer(difficulty: number): { correct: boolean; timeMs: number } {
  const baseAccuracy = difficulty === 1 ? 0.75 : difficulty === 2 ? 0.55 : 0.35
  const correct = Math.random() < baseAccuracy
  const timeMs = 2000 + Math.random() * 6000
  return { correct, timeMs: Math.round(timeMs) }
}

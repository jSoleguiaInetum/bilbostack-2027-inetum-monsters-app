import type { BattleResult } from '../types'

export interface BattlesRepository {
  list(userId: string): Promise<BattleResult[]>
  save(userId: string, battle: BattleResult): Promise<void>
  hasFought(userId: string, opponentId: string): Promise<boolean>
  getFoughtOpponents(userId: string): Promise<string[]>
}

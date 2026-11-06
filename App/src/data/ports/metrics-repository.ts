import type { Archetype } from '../../monster/types'
import type { ActionType, PlayerMetrics } from '../types'

export interface MetricsRepository {
  get(userId: string): Promise<PlayerMetrics>
  initialize(userId: string, rarityName: string): Promise<PlayerMetrics>
  addReward(
    userId: string,
    action: ActionType,
    contactArchetype?: Archetype,
    userArchetype?: Archetype,
  ): Promise<PlayerMetrics>
}

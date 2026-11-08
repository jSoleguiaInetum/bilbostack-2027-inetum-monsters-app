import type { MissionCheckResult, MissionProgress } from '../../lib/missions'

export interface MissionsRepository {
  list(userId: string): Promise<MissionProgress[]>
  checkAndComplete(userId: string): Promise<MissionCheckResult>
}

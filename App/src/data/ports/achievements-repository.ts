import type { Achievement, AchievementContext, UnlockedAchievement } from '../types'

export interface AchievementsRepository {
  listDefinitions(): Promise<Achievement[]>
  listUnlocked(userId: string): Promise<UnlockedAchievement[]>
  saveUnlocked(userId: string, unlocked: UnlockedAchievement[]): Promise<void>
  checkAndUnlock(userId: string, context: AchievementContext): Promise<UnlockedAchievement[]>
}

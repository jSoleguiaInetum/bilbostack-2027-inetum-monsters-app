import type {
  Achievement,
  AchievementContext,
  AchievementDefinitionInput,
  UnlockedAchievement,
} from '../types'

export interface AchievementsRepository {
  listDefinitions(): Promise<Achievement[]>
  listAllDefinitions(): Promise<Achievement[]>
  createDefinition(input: AchievementDefinitionInput): Promise<Achievement>
  updateDefinition(id: string, input: AchievementDefinitionInput): Promise<Achievement>
  deleteDefinition(id: string): Promise<void>
  listUnlocked(userId: string): Promise<UnlockedAchievement[]>
  saveUnlocked(userId: string, unlocked: UnlockedAchievement[]): Promise<void>
  checkAndUnlock(userId: string, context: AchievementContext): Promise<UnlockedAchievement[]>
}

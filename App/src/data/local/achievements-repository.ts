import { ACHIEVEMENT_DEFINITIONS, evaluateAchievements } from '../../lib/achievements'
import type { Achievement, AchievementContext, UnlockedAchievement } from '../types'
import type { AchievementsRepository } from '../ports/achievements-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function achievementsKey(userId: string): string {
  return userKey(STORAGE_KEYS.achievements, userId)
}

async function listDefinitions(): Promise<Achievement[]> {
  return ACHIEVEMENT_DEFINITIONS
}

async function listUnlocked(userId: string): Promise<UnlockedAchievement[]> {
  return readJson<UnlockedAchievement[]>(achievementsKey(userId), [])
}

async function saveUnlocked(userId: string, unlocked: UnlockedAchievement[]): Promise<void> {
  writeJson(achievementsKey(userId), unlocked)
}

async function checkAndUnlock(
  userId: string,
  context: AchievementContext,
): Promise<UnlockedAchievement[]> {
  const unlocked = await listUnlocked(userId)
  const result = evaluateAchievements(unlocked, context)
  if (result.newlyUnlocked.length > 0) {
    writeJson(achievementsKey(userId), result.unlocked)
  }
  return result.newlyUnlocked
}

export const localAchievementsRepository: AchievementsRepository = {
  listDefinitions,
  listUnlocked,
  saveUnlocked,
  checkAndUnlock,
}

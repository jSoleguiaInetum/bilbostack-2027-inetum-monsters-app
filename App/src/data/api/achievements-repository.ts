import type { AchievementsRepository } from '../ports'
import {
  toAchievement,
  toUnlockedAchievement,
  type AchievementDto,
  type UnlockedAchievementDto,
} from './dto'
import type { HttpClient } from './http-client'

export function createApiAchievementsRepository(client: HttpClient): AchievementsRepository {
  async function listDefinitions() {
    const dtos = await client.request<AchievementDto[]>('/achievements/definitions')
    return dtos.map(toAchievement)
  }

  async function listUnlocked(userId: string) {
    const dtos = await client.request<UnlockedAchievementDto[]>(
      `/users/${encodeURIComponent(userId)}/achievements`,
    )
    return dtos.map(toUnlockedAchievement)
  }

  async function saveUnlocked(
    userId: string,
    unlocked: Parameters<AchievementsRepository['saveUnlocked']>[1],
  ) {
    await client.request<void>(`/users/${encodeURIComponent(userId)}/achievements`, {
      method: 'PUT',
      body: unlocked,
    })
  }

  async function checkAndUnlock(
    userId: string,
    context: Parameters<AchievementsRepository['checkAndUnlock']>[1],
  ) {
    const dtos = await client.request<UnlockedAchievementDto[]>(
      `/users/${encodeURIComponent(userId)}/achievements/check`,
      { method: 'POST', body: context },
    )
    return dtos.map(toUnlockedAchievement)
  }

  return { listDefinitions, listUnlocked, saveUnlocked, checkAndUnlock }
}

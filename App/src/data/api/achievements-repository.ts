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
    return dtos.map(toAchievement).filter(achievement => achievement.isActive !== false)
  }

  async function listAllDefinitions() {
    const dtos = await client.request<AchievementDto[]>(
      '/achievements/definitions?includeInactive=true',
    )
    return dtos.map(toAchievement)
  }

  async function createDefinition(input: Parameters<AchievementsRepository['createDefinition']>[0]) {
    const dto = await client.request<AchievementDto>('/achievements/definitions', {
      method: 'POST',
      body: input,
    })
    return toAchievement(dto)
  }

  async function updateDefinition(
    id: string,
    input: Parameters<AchievementsRepository['updateDefinition']>[1],
  ) {
    const dto = await client.request<AchievementDto>(
      `/achievements/definitions/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: input },
    )
    return toAchievement(dto)
  }

  async function deleteDefinition(id: string) {
    await client.request<void>(
      `/achievements/definitions/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    )
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

  return {
    listDefinitions,
    listAllDefinitions,
    createDefinition,
    updateDefinition,
    deleteDefinition,
    listUnlocked,
    saveUnlocked,
    checkAndUnlock,
  }
}

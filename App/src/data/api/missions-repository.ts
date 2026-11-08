import type { MissionsRepository } from '../ports'
import {
  toMissionCheckResult,
  toMissionProgress,
  type MissionCheckDto,
  type MissionProgressDto,
} from './dto'
import type { HttpClient } from './http-client'

export function createApiMissionsRepository(client: HttpClient): MissionsRepository {
  async function list(userId: string) {
    const progress = await client.request<MissionProgressDto[]>(
      `/users/${encodeURIComponent(userId)}/missions`,
    )
    return (progress ?? []).map(toMissionProgress)
  }

  async function checkAndComplete(userId: string) {
    return toMissionCheckResult(await client.request<MissionCheckDto>(
      `/users/${encodeURIComponent(userId)}/missions/check`,
      { method: 'POST' },
    ))
  }

  return { list, checkAndComplete }
}

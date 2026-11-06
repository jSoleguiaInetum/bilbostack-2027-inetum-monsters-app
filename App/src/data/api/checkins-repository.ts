import { DataError } from '../errors'
import type { CheckInsRepository } from '../ports'
import { toCheckIn, type CheckInDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiCheckInsRepository(client: HttpClient): CheckInsRepository {
  async function list(userId: string) {
    const dtos = await client.request<CheckInDto[]>(
      `/users/${encodeURIComponent(userId)}/checkins`,
    )
    return dtos.map(toCheckIn)
  }

  async function hasCheckedIn(userId: string, talkId: string) {
    return (await list(userId)).some(checkIn => checkIn.talkId === talkId)
  }

  async function add(
    userId: string,
    checkIn: Parameters<CheckInsRepository['add']>[1],
  ) {
    try {
      await client.request<void>(`/users/${encodeURIComponent(userId)}/checkins`, {
        method: 'POST',
        body: checkIn,
      })
      return true
    } catch (error) {
      if (error instanceof DataError && error.code === 'CONFLICT') return false
      throw error
    }
  }

  return { list, hasCheckedIn, add }
}

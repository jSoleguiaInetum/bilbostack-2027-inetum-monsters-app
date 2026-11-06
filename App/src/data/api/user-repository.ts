import { DataError } from '../errors'
import type { UserRepository } from '../ports'
import { toUser, type UserDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiUserRepository(client: HttpClient): UserRepository {
  async function getUserById(id: string) {
    try {
      return toUser(await client.request<UserDto>(`/users/${encodeURIComponent(id)}`))
    } catch (error) {
      if (error instanceof DataError && error.code === 'NOT_FOUND') return null
      throw error
    }
  }

  async function list() {
    const dtos = await client.request<UserDto[]>('/users')
    return dtos.map(toUser)
  }

  return { getUserById, list }
}

import { DataError } from '../errors'
import type { AuthRepository } from '../ports'
import { toUser, type UserDto } from './dto'
import type { HttpClient } from './http-client'

function isNotFound(error: unknown): boolean {
  return error instanceof DataError && error.code === 'NOT_FOUND'
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof DataError && error.code === 'UNAUTHORIZED'
}

export function createApiAuthRepository(client: HttpClient): AuthRepository {
  return {
    async signUpWithEmail(email, password, name, archetype) {
      const dto = await client.request<UserDto>('/auth/register', {
        method: 'POST',
        body: { email, password, name, archetype },
      })
      return toUser(dto)
    },

    async signInWithEmail(email, password) {
      const dto = await client.request<UserDto>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      return toUser(dto)
    },

    async signInWithOAuth(provider) {
      const dto = await client.request<UserDto>(`/auth/oauth/${encodeURIComponent(provider)}`, {
        method: 'POST',
      })
      return toUser(dto)
    },

    async signOut() {
      await client.request<void>('/auth/logout', { method: 'POST' })
    },

    async getSession() {
      try {
        return toUser(await client.request<UserDto>('/auth/session'))
      } catch (error) {
        if (isUnauthorized(error)) return null
        throw error
      }
    },

    async getUserById(id) {
      try {
        return toUser(await client.request<UserDto>(`/users/${encodeURIComponent(id)}`))
      } catch (error) {
        if (isNotFound(error)) return null
        throw error
      }
    },
  }
}

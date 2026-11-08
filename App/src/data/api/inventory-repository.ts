import { DataError } from '../errors'
import type { InventoryRepository } from '../ports'
import { toGameObject, toUserObject, type GameObjectDto, type UserObjectDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiInventoryRepository(client: HttpClient): InventoryRepository {
  async function listDefinitions() {
    const dtos = await client.request<GameObjectDto[]>('/objects')
    return dtos.map(toGameObject).filter(object => object.isActive)
  }

  async function listOwned(userId: string) {
    const dtos = await client.request<UserObjectDto[]>(
      `/users/${encodeURIComponent(userId)}/inventory`,
    )
    return dtos.map(toUserObject)
  }

  async function has(userId: string, objectId: string) {
    return (await listOwned(userId)).some(object => object.objectId === objectId)
  }

  async function add(
    userId: string,
    object: Parameters<InventoryRepository['add']>[1],
  ) {
    try {
      await client.request<void>(`/users/${encodeURIComponent(userId)}/inventory`, {
        method: 'POST',
        body: object,
      })
      return true
    } catch (error) {
      if (error instanceof DataError && error.code === 'CONFLICT') return false
      throw error
    }
  }

  return { listDefinitions, listOwned, has, add }
}

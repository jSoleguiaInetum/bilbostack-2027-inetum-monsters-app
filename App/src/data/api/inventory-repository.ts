import { DataError } from '../errors'
import type { InventoryRepository } from '../ports'
import {
  toGameObject,
  toGameObjectBody,
  toUserObject,
  type GameObjectDto,
  type UserObjectDto,
} from './dto'
import type { HttpClient } from './http-client'

export function createApiInventoryRepository(client: HttpClient): InventoryRepository {
  async function listDefinitions() {
    const dtos = await client.request<GameObjectDto[]>('/objects')
    return dtos.map(toGameObject).filter(object => object.isActive)
  }

  async function listAllDefinitions() {
    const dtos = await client.request<GameObjectDto[]>('/objects?includeInactive=true')
    return dtos.map(toGameObject)
  }

  async function createDefinition(input: Parameters<InventoryRepository['createDefinition']>[0]) {
    const dto = await client.request<GameObjectDto>('/objects', {
      method: 'POST',
      body: toGameObjectBody(input),
    })
    return toGameObject(dto)
  }

  async function updateDefinition(
    id: string,
    input: Parameters<InventoryRepository['updateDefinition']>[1],
  ) {
    const dto = await client.request<GameObjectDto>(
      `/objects/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: toGameObjectBody(input) },
    )
    return toGameObject(dto)
  }

  async function deleteDefinition(id: string) {
    await client.request<void>(`/objects/${encodeURIComponent(id)}`, { method: 'DELETE' })
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

  return {
    listDefinitions,
    listAllDefinitions,
    createDefinition,
    updateDefinition,
    deleteDefinition,
    listOwned,
    has,
    add,
  }
}

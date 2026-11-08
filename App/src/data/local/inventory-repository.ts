import { SEED_OBJECTS } from '../../lib/objects'
import type { GameObject, UserObject } from '../types'
import type { InventoryRepository, NewUserObject } from '../ports/inventory-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function inventoryKey(userId: string): string {
  return userKey(STORAGE_KEYS.inventory, userId)
}

async function listDefinitions(): Promise<GameObject[]> {
  return SEED_OBJECTS.filter(object => object.isActive)
}

async function listOwned(userId: string): Promise<UserObject[]> {
  return readJson<UserObject[]>(inventoryKey(userId), [])
}

async function has(userId: string, objectId: string): Promise<boolean> {
  const owned = await listOwned(userId)
  return owned.some(object => object.objectId === objectId)
}

async function add(userId: string, object: NewUserObject): Promise<boolean> {
  const isKnownObject = SEED_OBJECTS.some(
    definition => definition.id === object.objectId && definition.isActive,
  )
  if (!isKnownObject) return false
  if (await has(userId, object.objectId)) return false

  const owned = await listOwned(userId)
  writeJson(inventoryKey(userId), [
    ...owned,
    { ...object, obtainedAt: new Date().toISOString() },
  ])
  return true
}

export const localInventoryRepository: InventoryRepository = {
  listDefinitions,
  listOwned,
  has,
  add,
}

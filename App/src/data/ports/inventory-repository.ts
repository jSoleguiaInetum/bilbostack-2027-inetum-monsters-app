import type { GameObject, UserObject } from '../types'

export type NewUserObject = Omit<UserObject, 'obtainedAt'>

export interface InventoryRepository {
  listDefinitions(): Promise<GameObject[]>
  listOwned(userId: string): Promise<UserObject[]>
  has(userId: string, objectId: string): Promise<boolean>
  add(userId: string, object: NewUserObject): Promise<boolean>
}

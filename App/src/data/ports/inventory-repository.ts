import type { GameObject, ObjectDefinitionInput, UserObject } from '../types'

export type NewUserObject = Omit<UserObject, 'obtainedAt'>

export interface InventoryRepository {
  listDefinitions(): Promise<GameObject[]>
  listAllDefinitions(): Promise<GameObject[]>
  createDefinition(input: ObjectDefinitionInput): Promise<GameObject>
  updateDefinition(id: string, input: ObjectDefinitionInput): Promise<GameObject>
  deleteDefinition(id: string): Promise<void>
  listOwned(userId: string): Promise<UserObject[]>
  has(userId: string, objectId: string): Promise<boolean>
  add(userId: string, object: NewUserObject): Promise<boolean>
}

import { SEED_OBJECTS, type GameObject, type ObjectDefinitionInput, type UserObject } from '../../lib/objects'
import type { InventoryRepository, NewUserObject } from '../ports/inventory-repository'
import { DataError } from '../errors'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

interface ObjectDefinitionStore {
  created: GameObject[]
  updated: Record<string, GameObject>
  deleted: string[]
}

const EMPTY_STORE: ObjectDefinitionStore = {
  created: [],
  updated: {},
  deleted: [],
}

function inventoryKey(userId: string): string {
  return userKey(STORAGE_KEYS.inventory, userId)
}

function readDefinitionStore(): ObjectDefinitionStore {
  return readJson<ObjectDefinitionStore>(STORAGE_KEYS.objectDefinitions, EMPTY_STORE)
}

function writeDefinitionStore(store: ObjectDefinitionStore): void {
  writeJson(STORAGE_KEYS.objectDefinitions, store)
}

function toDefinition(id: string, input: ObjectDefinitionInput): GameObject {
  return {
    ...input,
    id,
    benefitValue: Math.max(0, Math.floor(input.benefitValue)),
  }
}

function listAllDefinitions(): GameObject[] {
  const store = readDefinitionStore()
  const deleted = new Set(store.deleted)

  const base = SEED_OBJECTS
    .filter(definition => !deleted.has(definition.id))
    .map(definition => store.updated[definition.id] ?? definition)

  const custom = store.created.filter(definition => !deleted.has(definition.id))
  return [...base, ...custom]
}

function listDefinitions(): GameObject[] {
  return listAllDefinitions().filter(definition => definition.isActive)
}

function createDefinition(input: ObjectDefinitionInput): GameObject {
  const store = readDefinitionStore()
  const id = `object-${crypto.randomUUID()}`
  const definition = toDefinition(id, input)
  writeDefinitionStore({ ...store, created: [...store.created, definition] })
  return definition
}

function updateDefinition(id: string, input: ObjectDefinitionInput): GameObject {
  const store = readDefinitionStore()
  const definition = toDefinition(id, input)
  const isCustom = store.created.some(item => item.id === id)
  const isBase = SEED_OBJECTS.some(item => item.id === id)

  if (!isCustom && !isBase) {
    throw new DataError('NOT_FOUND', 'Objeto no encontrado')
  }

  if (isCustom) {
    writeDefinitionStore({
      ...store,
      created: store.created.map(item => (item.id === id ? definition : item)),
    })
  } else {
    writeDefinitionStore({
      ...store,
      updated: { ...store.updated, [id]: definition },
    })
  }

  return definition
}

function deleteDefinition(id: string): void {
  const store = readDefinitionStore()
  const isCustom = store.created.some(item => item.id === id)
  const isBase = SEED_OBJECTS.some(item => item.id === id)

  if (!isCustom && !isBase) {
    throw new DataError('NOT_FOUND', 'Objeto no encontrado')
  }

  writeDefinitionStore({
    ...store,
    created: store.created.filter(item => item.id !== id),
    updated: Object.fromEntries(
      Object.entries(store.updated).filter(([definitionId]) => definitionId !== id),
    ),
    deleted: isBase && !store.deleted.includes(id) ? [...store.deleted, id] : store.deleted,
  })
}

async function listOwned(userId: string): Promise<UserObject[]> {
  return readJson<UserObject[]>(inventoryKey(userId), [])
}

async function has(userId: string, objectId: string): Promise<boolean> {
  const owned = await listOwned(userId)
  return owned.some(object => object.objectId === objectId)
}

async function add(userId: string, object: NewUserObject): Promise<boolean> {
  const isKnownObject = listDefinitions().some(
    definition => definition.id === object.objectId,
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
  listDefinitions: async () => listDefinitions(),
  listAllDefinitions: async () => listAllDefinitions(),
  createDefinition: async input => createDefinition(input),
  updateDefinition: async (id, input) => updateDefinition(id, input),
  deleteDefinition: async id => deleteDefinition(id),
  listOwned,
  has,
  add,
}

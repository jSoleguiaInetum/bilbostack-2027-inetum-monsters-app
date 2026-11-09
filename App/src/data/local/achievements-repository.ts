import {
  ACHIEVEMENT_DEFINITIONS,
  evaluateAchievements,
  type Achievement,
  type AchievementContext,
  type AchievementDefinitionInput,
  type UnlockedAchievement,
} from '../../lib/achievements'
import type { AchievementsRepository } from '../ports/achievements-repository'
import { DataError } from '../errors'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

interface AchievementDefinitionStore {
  created: Achievement[]
  updated: Record<string, Achievement>
  deleted: string[]
}

const EMPTY_STORE: AchievementDefinitionStore = {
  created: [],
  updated: {},
  deleted: [],
}

function achievementsKey(userId: string): string {
  return userKey(STORAGE_KEYS.achievements, userId)
}

function readDefinitionStore(): AchievementDefinitionStore {
  return readJson<AchievementDefinitionStore>(STORAGE_KEYS.achievementDefinitions, EMPTY_STORE)
}

function writeDefinitionStore(store: AchievementDefinitionStore): void {
  writeJson(STORAGE_KEYS.achievementDefinitions, store)
}

function toDefinition(id: string, input: AchievementDefinitionInput): Achievement {
  return {
    ...input,
    id,
    objectId: input.objectId?.trim() || undefined,
    conditionTarget: Math.max(1, Math.floor(input.conditionTarget)),
  }
}

function listAllDefinitions(): Achievement[] {
  const store = readDefinitionStore()
  const deleted = new Set(store.deleted)

  const base = ACHIEVEMENT_DEFINITIONS
    .filter(definition => !deleted.has(definition.id))
    .map(definition => store.updated[definition.id] ?? definition)

  const custom = store.created.filter(definition => !deleted.has(definition.id))
  return [...base, ...custom]
}

function listDefinitions(): Achievement[] {
  return listAllDefinitions().filter(definition => definition.isActive !== false)
}

function createDefinition(input: AchievementDefinitionInput): Achievement {
  const store = readDefinitionStore()
  const id = `achievement-${crypto.randomUUID()}`
  const definition = toDefinition(id, input)
  writeDefinitionStore({ ...store, created: [...store.created, definition] })
  return definition
}

function updateDefinition(id: string, input: AchievementDefinitionInput): Achievement {
  const store = readDefinitionStore()
  const definition = toDefinition(id, input)
  const isCustom = store.created.some(item => item.id === id)
  const isBase = ACHIEVEMENT_DEFINITIONS.some(item => item.id === id)

  if (!isCustom && !isBase) {
    throw new DataError('NOT_FOUND', 'Logro no encontrado')
  }

  if (isCustom) {
    writeDefinitionStore({
      ...store,
      created: store.created.map(item => (item.id === id ? definition : item)),
    })
  } else {
    writeDefinitionStore({
      ...store,
      updated: { ...store.updated, [id]: { ...store.updated[id], ...definition } },
    })
  }

  return definition
}

function deleteDefinition(id: string): void {
  const store = readDefinitionStore()
  const isCustom = store.created.some(item => item.id === id)
  const isBase = ACHIEVEMENT_DEFINITIONS.some(item => item.id === id)

  if (!isCustom && !isBase) {
    throw new DataError('NOT_FOUND', 'Logro no encontrado')
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

async function listUnlocked(userId: string): Promise<UnlockedAchievement[]> {
  return readJson<UnlockedAchievement[]>(achievementsKey(userId), [])
}

async function saveUnlocked(userId: string, unlocked: UnlockedAchievement[]): Promise<void> {
  writeJson(achievementsKey(userId), unlocked)
}

async function checkAndUnlock(
  userId: string,
  context: AchievementContext,
): Promise<UnlockedAchievement[]> {
  const unlocked = await listUnlocked(userId)
  const result = evaluateAchievements(unlocked, context, listDefinitions())
  if (result.newlyUnlocked.length > 0) {
    writeJson(achievementsKey(userId), result.unlocked)
  }
  return result.newlyUnlocked
}

export const localAchievementsRepository: AchievementsRepository = {
  listDefinitions: async () => listDefinitions(),
  listAllDefinitions: async () => listAllDefinitions(),
  createDefinition: async input => createDefinition(input),
  updateDefinition: async (id, input) => updateDefinition(id, input),
  deleteDefinition: async id => deleteDefinition(id),
  listUnlocked,
  saveUnlocked,
  checkAndUnlock,
}

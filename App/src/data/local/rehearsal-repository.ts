import type { User } from '../../auth/types'
import type {
  RehearsalFeedback,
  RehearsalFeedbackInput,
  RehearsalRepository,
  RehearsalSeedOptions,
  RehearsalSeedResult,
} from '../ports/rehearsal-repository'
import { DataError } from '../errors'
import { DEFAULT_REHEARSAL_SEED_OPTIONS } from '../ports/rehearsal-repository'
import {
  buildRehearsalAchievements,
  buildRehearsalBattles,
  buildRehearsalContacts,
  buildRehearsalInventory,
  buildRehearsalMetrics,
  buildRehearsalMissions,
  buildRehearsalUserDataset,
  buildRehearsalUsers,
  REHEARSAL_ID_PREFIX,
  REHEARSAL_USER_PREFIX,
} from '../../lib/rehearsal-data'
import { readJson, removeKey, STORAGE_KEYS, userKey, writeJson } from './storage'

const FEEDBACK_KEY = 'bilbostack_rehearsal_feedback'

function isRehearsalUser(userId: string): boolean {
  return userId.startsWith(REHEARSAL_USER_PREFIX)
}

async function seed(userId: string | null, options?: Partial<RehearsalSeedOptions>): Promise<RehearsalSeedResult> {
  const settings = { ...DEFAULT_REHEARSAL_SEED_OPTIONS, ...options }
  const users = buildRehearsalUsers(settings.userCount)

  const existingUsers = readJson<User[]>(STORAGE_KEYS.users, [])
  const existingIds = new Set(existingUsers.map((user) => user.id))
  const newUsers = users.filter((user) => !existingIds.has(user.id))

  writeJson(STORAGE_KEYS.users, [...existingUsers, ...newUsers])

  let contactCount = 0
  for (let index = 0; index < users.length; index++) {
    const dataset = buildRehearsalUserDataset(users, index)
    const contacts = dataset.contacts.slice(0, settings.contactsPerUser)
    contactCount += contacts.length

    writeJson(userKey(STORAGE_KEYS.metrics, dataset.user.id), dataset.metrics)
    writeJson(userKey(STORAGE_KEYS.contacts, dataset.user.id), contacts)
    writeJson(userKey(STORAGE_KEYS.battles, dataset.user.id), dataset.battles)
    writeJson(userKey(STORAGE_KEYS.fought, dataset.user.id), [])
  }

  let enrichedCurrentUser = false
  if (userId) {
    writeJson(userKey(STORAGE_KEYS.metrics, userId), buildRehearsalMetrics())
    writeJson(userKey(STORAGE_KEYS.contacts, userId), buildRehearsalContacts(users))
    writeJson(userKey(STORAGE_KEYS.battles, userId), buildRehearsalBattles(users))
    writeJson(userKey(STORAGE_KEYS.achievements, userId), buildRehearsalAchievements())
    writeJson(userKey(STORAGE_KEYS.inventory, userId), buildRehearsalInventory())
    writeJson(userKey(STORAGE_KEYS.missions, userId), buildRehearsalMissions())
    enrichedCurrentUser = true
  }

  return {
    users: newUsers.length,
    contacts: contactCount,
    achievements: enrichedCurrentUser ? buildRehearsalAchievements().length : 0,
    objects: enrichedCurrentUser ? buildRehearsalInventory().length : 0,
    enrichedCurrentUser,
  }
}

async function reset(): Promise<void> {
  const existingUsers = readJson<{ id: string }[]>(STORAGE_KEYS.users, [])
  const kept = existingUsers.filter((user) => !isRehearsalUser(user.id))
  const removed = existingUsers.filter((user) => isRehearsalUser(user.id))

  writeJson(STORAGE_KEYS.users, kept)

  for (const user of removed) {
    removeKey(userKey(STORAGE_KEYS.metrics, user.id))
    removeKey(userKey(STORAGE_KEYS.contacts, user.id))
    removeKey(userKey(STORAGE_KEYS.battles, user.id))
    removeKey(userKey(STORAGE_KEYS.fought, user.id))
    removeKey(userKey(STORAGE_KEYS.achievements, user.id))
    removeKey(userKey(STORAGE_KEYS.inventory, user.id))
    removeKey(userKey(STORAGE_KEYS.missions, user.id))
    removeKey(userKey(STORAGE_KEYS.checkins, user.id))
  }

  removeKey(FEEDBACK_KEY)
}

async function saveFeedback(input: RehearsalFeedbackInput): Promise<RehearsalFeedback> {
  if (input.rating < 1 || input.rating > 5) {
    throw new DataError('VALIDATION', 'La puntuacion debe estar entre 1 y 5')
  }

  const entry: RehearsalFeedback = {
    ...input,
    id: `${REHEARSAL_ID_PREFIX}feedback-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  const entries = readJson<RehearsalFeedback[]>(FEEDBACK_KEY, [])
  writeJson(FEEDBACK_KEY, [...entries, entry])

  return entry
}

async function listFeedback(): Promise<RehearsalFeedback[]> {
  return readJson<RehearsalFeedback[]>(FEEDBACK_KEY, [])
}

export const localRehearsalRepository: RehearsalRepository = {
  seed,
  reset,
  saveFeedback,
  listFeedback,
}

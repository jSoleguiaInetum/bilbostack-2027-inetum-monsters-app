import type { CheckIn } from '../types'
import type { CheckInsRepository, NewCheckIn } from '../ports/checkins-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function checkinsKey(userId: string): string {
  return userKey(STORAGE_KEYS.checkins, userId)
}

async function list(userId: string): Promise<CheckIn[]> {
  return readJson<CheckIn[]>(checkinsKey(userId), [])
}

async function hasCheckedIn(userId: string, talkId: string): Promise<boolean> {
  const checkIns = await list(userId)
  return checkIns.some((checkIn) => checkIn.talkId === talkId)
}

async function add(userId: string, checkIn: NewCheckIn): Promise<boolean> {
  if (await hasCheckedIn(userId, checkIn.talkId)) return false

  const checkIns = await list(userId)
  writeJson(checkinsKey(userId), [
    ...checkIns,
    { ...checkIn, checkedInAt: new Date().toISOString() },
  ])
  return true
}

export const localCheckInsRepository: CheckInsRepository = {
  list,
  hasCheckedIn,
  add,
}

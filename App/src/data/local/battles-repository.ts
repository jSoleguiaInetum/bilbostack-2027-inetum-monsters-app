import type { BattleResult } from '../types'
import type { BattlesRepository } from '../ports/battles-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function battlesKey(userId: string): string {
  return userKey(STORAGE_KEYS.battles, userId)
}

function foughtKey(userId: string): string {
  return userKey(STORAGE_KEYS.fought, userId)
}

async function list(userId: string): Promise<BattleResult[]> {
  return readJson<BattleResult[]>(battlesKey(userId), [])
}

async function getFoughtOpponents(userId: string): Promise<string[]> {
  return readJson<string[]>(foughtKey(userId), [])
}

async function hasFought(userId: string, opponentId: string): Promise<boolean> {
  const fought = await getFoughtOpponents(userId)
  return fought.includes(opponentId)
}

async function save(userId: string, battle: BattleResult): Promise<void> {
  writeJson(battlesKey(userId), [...(await list(userId)), battle])

  const fought = await getFoughtOpponents(userId)
  if (!fought.includes(battle.opponentId)) {
    writeJson(foughtKey(userId), [...fought, battle.opponentId])
  }
}

export const localBattlesRepository: BattlesRepository = {
  list,
  save,
  hasFought,
  getFoughtOpponents,
}

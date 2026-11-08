import {
  evaluateMissionProgress,
  missionProgressValue,
  MISSION_DEFINITIONS,
  type MissionCheckResult,
  type MissionCompletion,
  type MissionContext,
  type MissionProgress,
} from '../../lib/missions'
import type { MissionsRepository } from '../ports/missions-repository'
import { localAchievementsRepository } from './achievements-repository'
import { localBattlesRepository } from './battles-repository'
import { localCheckInsRepository } from './checkins-repository'
import { localContactsRepository } from './contacts-repository'
import { localInventoryRepository } from './inventory-repository'
import { addCustomMetricsReward, localMetricsRepository } from './metrics-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function missionsKey(userId: string): string {
  return userKey(STORAGE_KEYS.missions, userId)
}

async function listCompletions(userId: string): Promise<MissionCompletion[]> {
  return readJson<MissionCompletion[]>(missionsKey(userId), [])
}

async function buildContext(userId: string): Promise<MissionContext> {
  const [metrics, contacts, battles, checkIns, unlocked] = await Promise.all([
    localMetricsRepository.get(userId),
    localContactsRepository.list(userId),
    localBattlesRepository.list(userId),
    localCheckInsRepository.list(userId),
    localAchievementsRepository.listUnlocked(userId),
  ])

  return {
    metrics,
    contactCount: contacts.length,
    battleCount: battles.length,
    battleWins: battles.filter(battle => battle.outcome === 'win').length,
    talkCount: checkIns.length,
    uniqueArchetypesContacted: new Set(contacts.map(contact => contact.archetype)).size,
    achievementCount: unlocked.length,
  }
}

async function list(userId: string): Promise<MissionProgress[]> {
  const [completions, context] = await Promise.all([
    listCompletions(userId),
    buildContext(userId),
  ])
  return evaluateMissionProgress(completions, context)
}

async function checkAndComplete(userId: string): Promise<MissionCheckResult> {
  const [completions, context] = await Promise.all([
    listCompletions(userId),
    buildContext(userId),
  ])
  const completedIds = new Set(completions.map(completion => completion.missionId))
  const pending = MISSION_DEFINITIONS.filter(mission => (
    mission.isActive
    && !completedIds.has(mission.id)
    && missionProgressValue(mission.objective, context) >= mission.objective.target
  ))

  if (pending.length === 0) {
    return { completed: [], metrics: context.metrics, grantedObjectIds: [] }
  }

  const completedAt = new Date().toISOString()
  writeJson(missionsKey(userId), [
    ...completions,
    ...pending.map(mission => ({ missionId: mission.id, completedAt })),
  ])

  const expertise = pending.reduce((total, mission) => total + mission.reward.expertise, 0)
  const auraTech = pending.reduce((total, mission) => total + mission.reward.auraTech, 0)
  const metrics = await addCustomMetricsReward(userId, expertise, auraTech)

  const grantedObjectIds: string[] = []
  for (const mission of pending) {
    if (!mission.reward.objectId) continue
    const granted = await localInventoryRepository.add(userId, {
      objectId: mission.reward.objectId,
      source: 'mission',
    })
    if (granted) grantedObjectIds.push(mission.reward.objectId)
  }

  return { completed: pending, metrics, grantedObjectIds }
}

export const localMissionsRepository: MissionsRepository = {
  list,
  checkAndComplete,
}

import type { Archetype } from '../../monster/types'
import { applyReward, createInitialMetrics, emptyMetrics } from '../../lib/metrics'
import type { ActionType, PlayerMetrics } from '../types'
import type { MetricsRepository } from '../ports/metrics-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function metricsKey(userId: string): string {
  return userKey(STORAGE_KEYS.metrics, userId)
}

async function get(userId: string): Promise<PlayerMetrics> {
  return readJson<PlayerMetrics>(metricsKey(userId), emptyMetrics())
}

async function initialize(userId: string, rarityName: string): Promise<PlayerMetrics> {
  const existing = await get(userId)
  if (existing.history.length > 0) return existing

  const metrics = createInitialMetrics(rarityName)
  writeJson(metricsKey(userId), metrics)
  return metrics
}

async function addReward(
  userId: string,
  action: ActionType,
  contactArchetype?: Archetype,
  userArchetype?: Archetype,
): Promise<PlayerMetrics> {
  const current = await get(userId)
  const updated = applyReward(current, action, contactArchetype, userArchetype)
  writeJson(metricsKey(userId), updated)
  return updated
}

export const localMetricsRepository: MetricsRepository = {
  get,
  initialize,
  addReward,
}

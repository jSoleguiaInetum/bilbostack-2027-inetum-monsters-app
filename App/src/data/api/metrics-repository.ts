import type { MetricsRepository } from '../ports'
import { toMetrics, type MetricsDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiMetricsRepository(client: HttpClient): MetricsRepository {
  async function get(userId: string) {
    return toMetrics(await client.request<MetricsDto>(
      `/users/${encodeURIComponent(userId)}/metrics`,
    ))
  }

  async function initialize(userId: string, rarityName: string) {
    return toMetrics(await client.request<MetricsDto>(
      `/users/${encodeURIComponent(userId)}/metrics`,
      { method: 'POST', body: { rarityName } },
    ))
  }

  async function addReward(
    userId: string,
    action: Parameters<MetricsRepository['addReward']>[1],
    contactArchetype?: Parameters<MetricsRepository['addReward']>[2],
    userArchetype?: Parameters<MetricsRepository['addReward']>[3],
  ) {
    return toMetrics(await client.request<MetricsDto>(
      `/users/${encodeURIComponent(userId)}/metrics/rewards`,
      { method: 'POST', body: { action, contactArchetype, userArchetype } },
    ))
  }

  return { get, initialize, addReward }
}

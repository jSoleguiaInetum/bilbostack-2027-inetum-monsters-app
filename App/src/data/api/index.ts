import type { Repositories } from '../ports'
import { createApiAchievementsRepository } from './achievements-repository'
import { createApiAuthRepository } from './auth-repository'
import { createApiBattlesRepository } from './battles-repository'
import { createApiCheckInsRepository } from './checkins-repository'
import { createApiContactsRepository } from './contacts-repository'
import { createApiDashboardRepository } from './dashboard-repository'
import { HttpClient, httpClient } from './http-client'
import { createApiInventoryRepository } from './inventory-repository'
import { createApiMetricsRepository } from './metrics-repository'
import { createApiRankingsRepository } from './rankings-repository'
import { createApiTalksRepository } from './talks-repository'
import { createApiUserRepository } from './user-repository'

export function createApiRepositories(client: HttpClient = httpClient): Repositories {
  return {
    auth: createApiAuthRepository(client),
    users: createApiUserRepository(client),
    metrics: createApiMetricsRepository(client),
    contacts: createApiContactsRepository(client),
    battles: createApiBattlesRepository(client),
    achievements: createApiAchievementsRepository(client),
    checkins: createApiCheckInsRepository(client),
    talks: createApiTalksRepository(client),
    rankings: createApiRankingsRepository(client),
    dashboard: createApiDashboardRepository(client),
    inventory: createApiInventoryRepository(client),
  }
}

export const apiRepositories = createApiRepositories()

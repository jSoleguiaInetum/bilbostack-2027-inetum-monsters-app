import type { Repositories } from '../ports'
import { localAchievementsRepository } from './achievements-repository'
import { localAuthRepository } from './auth-repository'
import { localBattlesRepository } from './battles-repository'
import { localCheckInsRepository } from './checkins-repository'
import { localContactsRepository } from './contacts-repository'
import { localDashboardRepository } from './dashboard-repository'
import { localFeatureFlagsRepository } from './feature-flags-repository'
import { localInventoryRepository } from './inventory-repository'
import { localMetricsRepository } from './metrics-repository'
import { localMissionsRepository } from './missions-repository'
import { localQrRepository } from './qr-repository'
import { localRankingsRepository } from './rankings-repository'
import { localTalksRepository } from './talks-repository'
import { localUserRepository } from './user-repository'

export const localRepositories: Repositories = {
  auth: localAuthRepository,
  users: localUserRepository,
  metrics: localMetricsRepository,
  contacts: localContactsRepository,
  battles: localBattlesRepository,
  achievements: localAchievementsRepository,
  checkins: localCheckInsRepository,
  talks: localTalksRepository,
  rankings: localRankingsRepository,
  dashboard: localDashboardRepository,
  inventory: localInventoryRepository,
  missions: localMissionsRepository,
  featureFlags: localFeatureFlagsRepository,
  qrs: localQrRepository,
}

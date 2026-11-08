import type { AchievementsRepository } from './achievements-repository'
import type { AuthRepository } from './auth-repository'
import type { BattlesRepository } from './battles-repository'
import type { CheckInsRepository } from './checkins-repository'
import type { ContactsRepository } from './contacts-repository'
import type { DashboardRepository } from './dashboard-repository'
import type { FeatureFlagsRepository } from './feature-flags-repository'
import type { InventoryRepository } from './inventory-repository'
import type { MetricsRepository } from './metrics-repository'
import type { MissionsRepository } from './missions-repository'
import type { RankingsRepository } from './rankings-repository'
import type { TalksRepository } from './talks-repository'
import type { UserRepository } from './user-repository'

export interface Repositories {
  auth: AuthRepository
  users: UserRepository
  metrics: MetricsRepository
  contacts: ContactsRepository
  battles: BattlesRepository
  achievements: AchievementsRepository
  checkins: CheckInsRepository
  talks: TalksRepository
  rankings: RankingsRepository
  dashboard: DashboardRepository
  inventory: InventoryRepository
  missions: MissionsRepository
  featureFlags: FeatureFlagsRepository
}

export type {
  AchievementsRepository,
  AuthRepository,
  BattlesRepository,
  CheckInsRepository,
  ContactsRepository,
  DashboardRepository,
  FeatureFlagsRepository,
  InventoryRepository,
  MetricsRepository,
  MissionsRepository,
  RankingsRepository,
  TalksRepository,
  UserRepository,
}
export type { NewContact } from './contacts-repository'
export type { NewCheckIn } from './checkins-repository'
export type { NewUserObject } from './inventory-repository'
export type { OAuthProvider } from './auth-repository'

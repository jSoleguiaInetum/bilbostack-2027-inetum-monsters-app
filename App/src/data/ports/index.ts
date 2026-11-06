import type { AchievementsRepository } from './achievements-repository'
import type { AuthRepository } from './auth-repository'
import type { BattlesRepository } from './battles-repository'
import type { CheckInsRepository } from './checkins-repository'
import type { ContactsRepository } from './contacts-repository'
import type { MetricsRepository } from './metrics-repository'
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
}

export type {
  AchievementsRepository,
  AuthRepository,
  BattlesRepository,
  CheckInsRepository,
  ContactsRepository,
  MetricsRepository,
  TalksRepository,
  UserRepository,
}
export type { NewContact } from './contacts-repository'
export type { NewCheckIn } from './checkins-repository'
export type { OAuthProvider } from './auth-repository'

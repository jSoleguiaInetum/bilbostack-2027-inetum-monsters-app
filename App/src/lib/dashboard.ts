import type { Archetype, Evolution } from '../monster/types'
import type { RankingCategory, RankingEntry } from './rankings'

export interface DashboardStats {
  totalUsers: number
  totalBattles: number
  totalContacts: number
  totalAchievements: number
}

export interface AdminDashboardStats extends DashboardStats {
  averageExpertise: number
  averageAuraTech: number
}

export interface AdminDashboard {
  stats: AdminDashboardStats
}

export interface RecentEvolution {
  userId: string
  name: string
  archetype: Archetype
  stage: Evolution
  totalPoints: number
  evolvedAt: string
}

export interface PublicDashboard {
  stats: DashboardStats
  rankings: Record<RankingCategory, RankingEntry[]>
  recentEvolutions: RecentEvolution[]
}

export interface DashboardOptions {
  rankingsLimit?: number
  evolutionsLimit?: number
}

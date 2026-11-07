import type { DashboardRepository } from '../ports/dashboard-repository'
import type { DashboardOptions, PublicDashboard, RecentEvolution } from '../../lib/dashboard'
import type { RankingCategory, RankingEntry } from '../../lib/rankings'
import type { PlayerMetrics } from '../../lib/metrics'
import type { User } from '../../auth/types'
import { getEvolutionStageFromTotal } from '../../lib/evolution'
import { localAchievementsRepository } from './achievements-repository'
import { localBattlesRepository } from './battles-repository'
import { localContactsRepository } from './contacts-repository'
import { localMetricsRepository } from './metrics-repository'
import { localRankingsRepository } from './rankings-repository'
import { localUserRepository } from './user-repository'

const DEFAULT_RANKINGS_LIMIT = 5
const DEFAULT_EVOLUTIONS_LIMIT = 10
const CATEGORIES: RankingCategory[] = ['aura', 'expertise', 'contacts', 'wins']

function positiveLimit(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback
  return Math.max(0, Math.floor(value))
}

function latestEvolution(user: User, metrics: PlayerMetrics): RecentEvolution | null {
  let expertise = 0
  let auraTech = 0
  let stage = 0
  let evolvedAt: string | null = null
  let totalPoints = 0

  for (const entry of metrics.history) {
    expertise += entry.expertise
    auraTech += entry.auraTech
    const total = expertise + auraTech
    const nextStage = getEvolutionStageFromTotal(total)
    if (nextStage > stage) {
      stage = nextStage
      evolvedAt = entry.timestamp
      totalPoints = total
    }
  }

  if (stage === 0 || !evolvedAt) return null

  return {
    userId: user.id,
    name: user.name,
    archetype: user.archetype,
    stage: stage as RecentEvolution['stage'],
    totalPoints,
    evolvedAt,
  }
}

async function getOverview(options: DashboardOptions = {}): Promise<PublicDashboard> {
  const rankingsLimit = positiveLimit(options.rankingsLimit, DEFAULT_RANKINGS_LIMIT)
  const evolutionsLimit = positiveLimit(options.evolutionsLimit, DEFAULT_EVOLUTIONS_LIMIT)

  const users = await localUserRepository.list()

  const rankings = {} as Record<RankingCategory, RankingEntry[]>
  await Promise.all(CATEGORIES.map(async (category) => {
    const ranking = await localRankingsRepository.getByCategory(category, { limit: rankingsLimit })
    rankings[category] = ranking.entries
  }))

  const aggregates = await Promise.all(users.map(async (user) => {
    const [metrics, contacts, battles, achievements] = await Promise.all([
      localMetricsRepository.get(user.id),
      localContactsRepository.list(user.id),
      localBattlesRepository.list(user.id),
      localAchievementsRepository.listUnlocked(user.id),
    ])

    return {
      battles: battles.length,
      contacts: contacts.length,
      achievements: achievements.length,
      evolution: latestEvolution(user, metrics),
    }
  }))

  const recentEvolutions = aggregates
    .map(aggregate => aggregate.evolution)
    .filter((evolution): evolution is RecentEvolution => evolution !== null)
    .sort((left, right) => (
      right.evolvedAt.localeCompare(left.evolvedAt)
      || left.userId.localeCompare(right.userId)
    ))
    .slice(0, evolutionsLimit)

  return {
    stats: {
      totalUsers: users.length,
      totalBattles: aggregates.reduce((total, aggregate) => total + aggregate.battles, 0),
      totalContacts: aggregates.reduce((total, aggregate) => total + aggregate.contacts, 0),
      totalAchievements: aggregates.reduce((total, aggregate) => total + aggregate.achievements, 0),
    },
    rankings,
    recentEvolutions,
  }
}

export const localDashboardRepository: DashboardRepository = {
  getOverview,
}

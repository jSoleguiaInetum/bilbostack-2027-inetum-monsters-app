import type { RankingsRepository } from '../ports/rankings-repository'
import type {
  Ranking,
  RankingCategory,
  RankingEntry,
  RankingOptions,
} from '../../lib/rankings'
import { localBattlesRepository } from './battles-repository'
import { localContactsRepository } from './contacts-repository'
import { localMetricsRepository } from './metrics-repository'
import { localUserRepository } from './user-repository'

const DEFAULT_LIMIT = 20

interface RankingCandidate {
  userId: string
  name: string
  archetype: RankingEntry['archetype']
  score: number
}

function scoreFor(
  category: RankingCategory,
  expertise: number,
  auraTech: number,
  contactCount: number,
  winCount: number,
): number {
  if (category === 'expertise') return expertise
  if (category === 'aura') return auraTech
  if (category === 'contacts') return contactCount
  return winCount
}

async function getByCategory(
  category: RankingCategory,
  options: RankingOptions = {},
): Promise<Ranking> {
  const users = await localUserRepository.list()

  const candidates: RankingCandidate[] = await Promise.all(users.map(async (user) => {
    const [metrics, contacts, battles] = await Promise.all([
      localMetricsRepository.get(user.id),
      localContactsRepository.list(user.id),
      localBattlesRepository.list(user.id),
    ])
    const winCount = battles.filter(battle => battle.outcome === 'win').length

    return {
      userId: user.id,
      name: user.name,
      archetype: user.archetype,
      score: scoreFor(category, metrics.expertise, metrics.auraTech, contacts.length, winCount),
    }
  }))

  candidates.sort((left, right) => (
    right.score - left.score
    || left.name.localeCompare(right.name, 'es')
    || left.userId.localeCompare(right.userId)
  ))

  const ranked: RankingEntry[] = candidates.map((candidate, index) => ({
    ...candidate,
    rank: index + 1,
  }))
  const limit = Math.max(0, Math.floor(options.limit ?? DEFAULT_LIMIT))
  const currentUser = options.currentUserId
    ? ranked.find(entry => entry.userId === options.currentUserId) ?? null
    : null

  return {
    category,
    entries: ranked.slice(0, limit),
    currentUser,
  }
}

export const localRankingsRepository: RankingsRepository = {
  getByCategory,
}

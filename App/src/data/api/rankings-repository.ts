import type { RankingsRepository } from '../ports'
import type { RankingCategory, RankingOptions } from '../../lib/rankings'
import { toRanking, type RankingDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiRankingsRepository(client: HttpClient): RankingsRepository {
  async function getByCategory(
    category: RankingCategory,
    options: RankingOptions = {},
  ) {
    const params = new URLSearchParams({
      category,
      limit: String(options.limit ?? 20),
    })
    if (options.currentUserId) {
      params.set('userId', options.currentUserId)
    }

    const dto = await client.request<RankingDto>(`/rankings?${params.toString()}`)
    return toRanking(dto)
  }

  return { getByCategory }
}

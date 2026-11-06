import type { Ranking, RankingCategory, RankingOptions } from '../../lib/rankings'

export interface RankingsRepository {
  getByCategory(category: RankingCategory, options?: RankingOptions): Promise<Ranking>
}

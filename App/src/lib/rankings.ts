import type { Archetype } from '../monster/types'

export type RankingCategory = 'expertise' | 'aura' | 'contacts' | 'wins'

export interface RankingEntry {
  rank: number
  userId: string
  name: string
  archetype: Archetype
  score: number
}

export interface Ranking {
  category: RankingCategory
  entries: RankingEntry[]
  currentUser: RankingEntry | null
}

export interface RankingOptions {
  limit?: number
  currentUserId?: string
}

import type { User } from '../../auth/types'
import type { Archetype } from '../../monster/types'
import type { PlayerMetrics } from '../../lib/metrics'
import type { Contact } from '../../lib/contacts'
import type { BattleResult } from '../../lib/battle'
import type { CheckIn } from '../../lib/checkins'
import type { Achievement, UnlockedAchievement } from '../../lib/achievements'
import type { Talk } from '../../lib/seed-talks'
import type { Ranking, RankingCategory, RankingEntry } from '../../lib/rankings'

export interface UserDto {
  id: string
  email: string
  name: string
  archetype: Archetype
  createdAt: string
}

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    archetype: dto.archetype,
    createdAt: dto.createdAt,
  }
}

export interface MetricsEntryDto {
  action: PlayerMetrics['history'][number]['action']
  expertise: number
  auraTech: number
  timestamp: string
}

export interface MetricsDto {
  expertise: number
  auraTech: number
  history: MetricsEntryDto[]
}

export function toMetrics(dto: MetricsDto): PlayerMetrics {
  return {
    expertise: dto.expertise ?? 0,
    auraTech: dto.auraTech ?? 0,
    history: (dto.history ?? []).map(entry => ({ ...entry })),
  }
}

export interface ContactDto {
  userId: string
  name: string
  email: string
  archetype: Archetype
  connectedAt: string
  origin?: Contact['origin']
}

export function toContact(dto: ContactDto): Contact {
  return {
    userId: dto.userId,
    name: dto.name,
    email: dto.email,
    archetype: dto.archetype,
    connectedAt: dto.connectedAt,
    origin: dto.origin,
  }
}

export interface BattleDto {
  id: string
  opponentId: string
  opponentName: string
  opponentArchetype: Archetype
  rounds: BattleResult['rounds']
  outcome: BattleResult['outcome']
  timestamp: string
}

export function toBattle(dto: BattleDto): BattleResult {
  return {
    id: dto.id,
    opponentId: dto.opponentId,
    opponentName: dto.opponentName,
    opponentArchetype: dto.opponentArchetype,
    rounds: dto.rounds,
    outcome: dto.outcome,
    timestamp: dto.timestamp,
  }
}

export interface CheckInDto {
  talkId: string
  title: string
  speaker: string
  checkedInAt: string
}

export function toCheckIn(dto: CheckInDto): CheckIn {
  return {
    talkId: dto.talkId,
    title: dto.title,
    speaker: dto.speaker,
    checkedInAt: dto.checkedInAt,
  }
}

export interface AchievementDto {
  id: string
  name: string
  description: string
  icon: string
  hidden: boolean
}

export function toAchievement(dto: AchievementDto): Achievement {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    icon: dto.icon,
    hidden: dto.hidden,
    condition: () => false,
  }
}

export interface UnlockedAchievementDto {
  id: string
  unlockedAt: string
}

export function toUnlockedAchievement(dto: UnlockedAchievementDto): UnlockedAchievement {
  return { id: dto.id, unlockedAt: dto.unlockedAt }
}

export interface TalkDto {
  talkId: string
  title: string
  speaker: string
}

export function toTalk(dto: TalkDto): Talk {
  return { talkId: dto.talkId, title: dto.title, speaker: dto.speaker }
}

export interface RankingEntryDto {
  rank: number
  userId: string
  name: string
  archetype: Archetype
  score: number
}

export interface RankingDto {
  category: RankingCategory
  entries: RankingEntryDto[]
  currentUser?: RankingEntryDto | null
}

function toRankingEntry(dto: RankingEntryDto): RankingEntry {
  return {
    rank: dto.rank,
    userId: dto.userId,
    name: dto.name,
    archetype: dto.archetype,
    score: dto.score,
  }
}

export function toRanking(dto: RankingDto): Ranking {
  return {
    category: dto.category,
    entries: (dto.entries ?? []).map(toRankingEntry),
    currentUser: dto.currentUser ? toRankingEntry(dto.currentUser) : null,
  }
}

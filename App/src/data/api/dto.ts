import type { User, UserRole } from '../../auth/types'
import { isKnownRole } from '../../auth/roles'
import type { Archetype, Evolution } from '../../monster/types'
import type { PlayerMetrics } from '../../lib/metrics'
import type { Contact } from '../../lib/contacts'
import type { BattleResult } from '../../lib/battle'
import type { CheckIn } from '../../lib/checkins'
import type { Achievement, UnlockedAchievement } from '../../lib/achievements'
import type { Talk } from '../../lib/seed-talks'
import type { Ranking, RankingCategory, RankingEntry } from '../../lib/rankings'
import type { AdminDashboard, PublicDashboard, RecentEvolution } from '../../lib/dashboard'
import { resolveFeatureFlags, type FeatureFlagValues } from '../../lib/feature-flags'
import type {
  GameObject,
  ObjectBenefitType,
  ObjectRarity,
  ObjectSource,
  UserObject,
} from '../../lib/objects'

export interface UserDto {
  id: string
  email: string
  name: string
  archetype: Archetype
  role?: UserRole
  createdAt: string
}

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    archetype: dto.archetype,
    role: dto.role && isKnownRole(dto.role) ? dto.role : 'participant',
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

const OBJECT_RARITIES: ObjectRarity[] = ['Inusual', 'Singular', 'Único', 'Épico', 'Legendario']
const OBJECT_BENEFIT_TYPES: ObjectBenefitType[] = [
  'ExpertiseBoost',
  'AuraTechBoost',
  'Cosmetic',
  'Title',
  'Special',
]
const OBJECT_SOURCES: ObjectSource[] = ['achievement', 'qr', 'battle', 'mission']
const RARITY_ALIASES: Record<string, ObjectRarity> = {
  Unico: 'Único',
  Epico: 'Épico',
}

function toObjectRarity(value: string | undefined): ObjectRarity {
  if (!value) return 'Inusual'
  const normalized = RARITY_ALIASES[value] ?? value
  return OBJECT_RARITIES.includes(normalized as ObjectRarity)
    ? normalized as ObjectRarity
    : 'Inusual'
}

function toBenefitType(value: string | undefined): ObjectBenefitType {
  return OBJECT_BENEFIT_TYPES.includes(value as ObjectBenefitType)
    ? value as ObjectBenefitType
    : 'Special'
}

function toObjectSource(value: string | undefined): ObjectSource {
  return OBJECT_SOURCES.includes(value as ObjectSource)
    ? value as ObjectSource
    : 'achievement'
}

export interface GameObjectDto {
  id: string
  name: string
  description?: string
  rarity?: string
  benefit?: string
  benefit_type?: string
  benefit_value?: number
  icon_url: string
  origin?: string
  is_active?: boolean
}

export function toGameObject(dto: GameObjectDto): GameObject {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    rarity: toObjectRarity(dto.rarity),
    benefit: dto.benefit ?? '',
    benefitType: toBenefitType(dto.benefit_type),
    benefitValue: dto.benefit_value ?? 0,
    iconUrl: dto.icon_url,
    origin: dto.origin ?? '',
    isActive: dto.is_active ?? true,
  }
}

export interface UserObjectDto {
  object_id: string
  obtained_at: string
  source?: string
}

export function toUserObject(dto: UserObjectDto): UserObject {
  return {
    objectId: dto.object_id,
    obtainedAt: dto.obtained_at,
    source: toObjectSource(dto.source),
  }
}

export type FeatureFlagsDto = Record<string, boolean>

export function toFeatureFlags(dto: FeatureFlagsDto | null | undefined): FeatureFlagValues {
  return resolveFeatureFlags(dto)
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

export interface DashboardStatsDto {
  totalUsers: number
  totalBattles: number
  totalContacts: number
  totalAchievements: number
}

export interface RecentEvolutionDto {
  userId: string
  name: string
  archetype: Archetype
  stage: Evolution
  totalPoints: number
  evolvedAt: string
}

export interface DashboardDto {
  stats: DashboardStatsDto
  rankings?: Partial<Record<RankingCategory, RankingEntryDto[]>>
  recentEvolutions?: RecentEvolutionDto[]
}

export interface AdminDashboardStatsDto extends DashboardStatsDto {
  averageExpertise?: number
  averageAuraTech?: number
}

export interface AdminDashboardDto {
  stats: AdminDashboardStatsDto
}

export function toAdminDashboard(dto: AdminDashboardDto): AdminDashboard {
  return {
    stats: {
      totalUsers: dto.stats?.totalUsers ?? 0,
      totalBattles: dto.stats?.totalBattles ?? 0,
      totalContacts: dto.stats?.totalContacts ?? 0,
      totalAchievements: dto.stats?.totalAchievements ?? 0,
      averageExpertise: dto.stats?.averageExpertise ?? 0,
      averageAuraTech: dto.stats?.averageAuraTech ?? 0,
    },
  }
}

const DASHBOARD_CATEGORIES: RankingCategory[] = ['aura', 'expertise', 'contacts', 'wins']

function toRecentEvolution(dto: RecentEvolutionDto): RecentEvolution {
  return {
    userId: dto.userId,
    name: dto.name,
    archetype: dto.archetype,
    stage: dto.stage,
    totalPoints: dto.totalPoints,
    evolvedAt: dto.evolvedAt,
  }
}

export function toDashboard(dto: DashboardDto): PublicDashboard {
  const rankings = {} as PublicDashboard['rankings']
  for (const category of DASHBOARD_CATEGORIES) {
    rankings[category] = (dto.rankings?.[category] ?? []).map(toRankingEntry)
  }

  return {
    stats: {
      totalUsers: dto.stats?.totalUsers ?? 0,
      totalBattles: dto.stats?.totalBattles ?? 0,
      totalContacts: dto.stats?.totalContacts ?? 0,
      totalAchievements: dto.stats?.totalAchievements ?? 0,
    },
    rankings,
    recentEvolutions: (dto.recentEvolutions ?? []).map(toRecentEvolution),
  }
}

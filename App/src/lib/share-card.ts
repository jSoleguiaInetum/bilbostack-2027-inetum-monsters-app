import { ARCHETYPES } from './constants'
import { EVOLUTION_THRESHOLDS, getEvolutionStage } from './evolution'
import { getMonsterAssets } from '../monster/generator'
import type { Archetype, MonsterAssets, MonsterParams } from '../monster/types'
import type { PlayerMetrics } from './metrics'
import type { Achievement } from './achievements'

export const SHARE_CARD_WIDTH = 1200
export const SHARE_CARD_HEIGHT = 630
export const SHARE_CARD_LAYERS = [
  'aura',
  'body',
  'pattern',
  'eyes',
  'mouth',
  'accessory',
  'badge',
] as const

export interface ShareCardUser {
  name: string
  archetype: Archetype
}

export interface ShareCardInput {
  user: ShareCardUser
  metrics: PlayerMetrics
  params: MonsterParams
  achievements: Achievement[]
  featuredAchievementId?: string
}

export interface ShareCardModel {
  kind: 'monster' | 'achievement'
  userName: string
  archetypeName: string
  rarityName: string
  rarityColor: string
  rarityBgColor: string
  evolutionLabel: string
  expertise: number
  auraTech: number
  achievements: Achievement[]
  featured: Achievement | null
  assets: MonsterAssets
  shareText: string
  fileName: string
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildShareText(input: {
  userName: string
  expertise: number
  auraTech: number
  achievementCount: number
  featured: Achievement | null
}): string {
  if (input.featured) {
    return `¡Desbloqueé "${input.featured.name}" en BilboStack 2027! ${input.featured.description} #BilboStack2027 #Inetum`
  }

  return `¡Esta es mi criatura en BilboStack 2027! ⚡ ${input.expertise} Expertise · ✨ ${input.auraTech} Aura Tech · ${input.achievementCount} logros. #BilboStack2027 #Inetum`
}

export function buildShareCardModel(input: ShareCardInput): ShareCardModel {
  const evolution = getEvolutionStage(input.metrics)
  const featured = input.featuredAchievementId
    ? input.achievements.find(achievement => achievement.id === input.featuredAchievementId) ?? null
    : null
  const archetypeName = ARCHETYPES.find(archetype => archetype.key === input.user.archetype)?.name
    ?? input.user.archetype
  const evolutionLabel = EVOLUTION_THRESHOLDS.find(threshold => threshold.stage === evolution)?.label
    ?? 'Base'

  return {
    kind: featured ? 'achievement' : 'monster',
    userName: input.user.name,
    archetypeName,
    rarityName: input.params.rarity.name,
    rarityColor: input.params.rarity.color,
    rarityBgColor: input.params.rarity.bgColor,
    evolutionLabel,
    expertise: input.metrics.expertise,
    auraTech: input.metrics.auraTech,
    achievements: input.achievements,
    featured,
    assets: getMonsterAssets(input.params, input.user.archetype, evolution),
    shareText: buildShareText({
      userName: input.user.name,
      expertise: input.metrics.expertise,
      auraTech: input.metrics.auraTech,
      achievementCount: input.achievements.length,
      featured,
    }),
    fileName: featured
      ? `bilbostack-2027-logro-${slugify(featured.name) || featured.id}.png`
      : `bilbostack-2027-${slugify(input.user.name) || 'criatura'}.png`,
  }
}

export function buildShareLinks(url: string, text: string): { linkedin: string; twitter: string } {
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  }
}

export function buildShareUrl(origin: string): string {
  return `${origin.replace(/\/+$/, '')}/dashboard`
}

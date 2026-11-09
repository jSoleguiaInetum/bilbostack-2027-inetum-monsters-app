import type { PlayerMetrics } from './metrics'

export type AchievementConditionType =
  | 'contacts'
  | 'battles'
  | 'battle_wins'
  | 'archetypes'
  | 'expertise'
  | 'aura'
  | 'total'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  hidden: boolean
  objectId?: string
  isActive?: boolean
  conditionType?: AchievementConditionType
  conditionTarget?: number
  condition?: (ctx: AchievementContext) => boolean
}

export interface AchievementDefinitionInput {
  name: string
  description: string
  icon: string
  hidden: boolean
  objectId?: string
  isActive: boolean
  conditionType: AchievementConditionType
  conditionTarget: number
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
  objectId?: string
}

export interface AchievementContext {
  userId: string
  metrics: PlayerMetrics
  contactCount: number
  battleCount: number
  battleWins: number
  uniqueArchetypesContacted: number
}

export const ACHIEVEMENT_CONDITION_TYPES: AchievementConditionOption[] = [
  { value: 'contacts', label: 'Contactos' },
  { value: 'battles', label: 'Combates jugados' },
  { value: 'battle_wins', label: 'Combates ganados' },
  { value: 'archetypes', label: 'Arquetipos distintos' },
  { value: 'expertise', label: 'Expertise' },
  { value: 'aura', label: 'Aura Tech' },
  { value: 'total', label: 'Expertise + Aura Tech' },
]

export interface AchievementConditionOption {
  value: AchievementConditionType
  label: string
}

export function achievementProgressValue(
  type: AchievementConditionType,
  context: AchievementContext,
): number {
  switch (type) {
    case 'contacts':
      return context.contactCount
    case 'battles':
      return context.battleCount
    case 'battle_wins':
      return context.battleWins
    case 'archetypes':
      return context.uniqueArchetypesContacted
    case 'expertise':
      return context.metrics.expertise
    case 'aura':
      return context.metrics.auraTech
    case 'total':
      return context.metrics.expertise + context.metrics.auraTech
  }
}

export function achievementMatches(
  achievement: Achievement,
  context: AchievementContext,
): boolean {
  if (achievement.condition) return achievement.condition(context)
  if (!achievement.conditionType) return false
  return achievementProgressValue(achievement.conditionType, context)
    >= (achievement.conditionTarget ?? 0)
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first-contact',
    name: 'Primer contacto',
    description: 'Añade a tu primer contacto',
    icon: '🤝',
    hidden: false,
    isActive: true,
    conditionType: 'contacts',
    conditionTarget: 1,
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Consigue 5 contactos',
    icon: '🕸️',
    hidden: false,
    isActive: true,
    conditionType: 'contacts',
    conditionTarget: 5,
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Consigue 15 contactos',
    icon: '🦋',
    hidden: false,
    isActive: true,
    conditionType: 'contacts',
    conditionTarget: 15,
  },
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Gana tu primer combate',
    icon: '⚔️',
    hidden: false,
    isActive: true,
    conditionType: 'battle_wins',
    conditionTarget: 1,
  },
  {
    id: 'gladiator',
    name: 'Gladiador',
    description: 'Gana 5 combates',
    icon: '🏆',
    hidden: false,
    isActive: true,
    conditionType: 'battle_wins',
    conditionTarget: 5,
  },
  {
    id: 'battle-veteran',
    name: 'Veterano',
    description: 'Participa en 10 combates',
    icon: '🛡️',
    hidden: false,
    isActive: true,
    conditionType: 'battles',
    conditionTarget: 10,
  },
  {
    id: 'diverse-network',
    name: 'Red Diversa',
    description: 'Conecta con al menos 4 arquetipos diferentes',
    icon: '🌈',
    hidden: false,
    isActive: true,
    conditionType: 'archetypes',
    conditionTarget: 4,
  },
  {
    id: 'all-archetypes',
    name: 'Coleccionista',
    description: 'Conecta con los 8 arquetipos',
    icon: '🧩',
    hidden: true,
    isActive: true,
    conditionType: 'archetypes',
    conditionTarget: 8,
  },
  {
    id: 'expert',
    name: 'Experto',
    description: 'Alcanza 50 puntos de Expertise',
    icon: '⚡',
    hidden: false,
    isActive: true,
    conditionType: 'expertise',
    conditionTarget: 50,
  },
  {
    id: 'aura-master',
    name: 'Maestro del Aura',
    description: 'Alcanza 50 puntos de Aura Tech',
    icon: '✨',
    hidden: false,
    isActive: true,
    conditionType: 'aura',
    conditionTarget: 50,
  },
  {
    id: 'evolved',
    name: 'Evolución',
    description: 'Evoluciona tu criatura por primera vez',
    icon: '🧬',
    hidden: false,
    isActive: true,
    conditionType: 'total',
    conditionTarget: 20,
  },
  {
    id: 'max-evolution',
    name: 'Forma Final',
    description: 'Alcanza la evolución máxima',
    icon: '👑',
    hidden: true,
    isActive: true,
    conditionType: 'total',
    conditionTarget: 120,
  },
]

export function evaluateAchievements(
  unlocked: UnlockedAchievement[],
  context: AchievementContext,
  definitions: Achievement[] = ACHIEVEMENT_DEFINITIONS,
): { unlocked: UnlockedAchievement[]; newlyUnlocked: UnlockedAchievement[] } {
  const unlockedIds = new Set(unlocked.map((achievement) => achievement.id))
  const next = [...unlocked]
  const newlyUnlocked: UnlockedAchievement[] = []

  for (const def of definitions) {
    if (def.isActive === false) continue
    if (unlockedIds.has(def.id)) continue
    if (achievementMatches(def, context)) {
      const entry = {
        id: def.id,
        unlockedAt: new Date().toISOString(),
        objectId: def.objectId,
      }
      newlyUnlocked.push(entry)
      next.push(entry)
    }
  }

  return { unlocked: next, newlyUnlocked }
}

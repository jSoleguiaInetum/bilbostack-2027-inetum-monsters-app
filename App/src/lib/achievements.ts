import type { PlayerMetrics } from './metrics'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  hidden: boolean
  condition: (ctx: AchievementContext) => boolean
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

export interface AchievementContext {
  userId: string
  metrics: PlayerMetrics
  contactCount: number
  battleCount: number
  battleWins: number
  uniqueArchetypesContacted: number
}

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first-contact',
    name: 'Primer contacto',
    description: 'Añade a tu primer contacto',
    icon: '🤝',
    hidden: false,
    condition: (ctx) => ctx.contactCount >= 1,
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Consigue 5 contactos',
    icon: '🌐',
    hidden: false,
    condition: (ctx) => ctx.contactCount >= 5,
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Consigue 15 contactos',
    icon: '🦋',
    hidden: false,
    condition: (ctx) => ctx.contactCount >= 15,
  },
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Gana tu primer combate',
    icon: '⚔️',
    hidden: false,
    condition: (ctx) => ctx.battleWins >= 1,
  },
  {
    id: 'gladiator',
    name: 'Gladiador',
    description: 'Gana 5 combates',
    icon: '🏛️',
    hidden: false,
    condition: (ctx) => ctx.battleWins >= 5,
  },
  {
    id: 'battle-veteran',
    name: 'Veterano',
    description: 'Participa en 10 combates',
    icon: '🎖️',
    hidden: false,
    condition: (ctx) => ctx.battleCount >= 10,
  },
  {
    id: 'diverse-network',
    name: 'Red Diversa',
    description: 'Conecta con al menos 4 arquetipos diferentes',
    icon: '🌈',
    hidden: false,
    condition: (ctx) => ctx.uniqueArchetypesContacted >= 4,
  },
  {
    id: 'all-archetypes',
    name: 'Coleccionista',
    description: 'Conecta con los 8 arquetipos',
    icon: '💎',
    hidden: true,
    condition: (ctx) => ctx.uniqueArchetypesContacted >= 8,
  },
  {
    id: 'expert',
    name: 'Experto',
    description: 'Alcanza 50 puntos de Expertise',
    icon: '⚡',
    hidden: false,
    condition: (ctx) => ctx.metrics.expertise >= 50,
  },
  {
    id: 'aura-master',
    name: 'Maestro del Aura',
    description: 'Alcanza 50 puntos de Aura Tech',
    icon: '✨',
    hidden: false,
    condition: (ctx) => ctx.metrics.auraTech >= 50,
  },
  {
    id: 'evolved',
    name: 'Evolución',
    description: 'Evoluciona tu criatura por primera vez',
    icon: '🧬',
    hidden: false,
    condition: (ctx) => (ctx.metrics.expertise + ctx.metrics.auraTech) >= 20,
  },
  {
    id: 'max-evolution',
    name: 'Forma Final',
    description: 'Alcanza la evolución máxima',
    icon: '🐉',
    hidden: true,
    condition: (ctx) => (ctx.metrics.expertise + ctx.metrics.auraTech) >= 120,
  },
]

export function evaluateAchievements(
  unlocked: UnlockedAchievement[],
  context: AchievementContext,
): { unlocked: UnlockedAchievement[]; newlyUnlocked: UnlockedAchievement[] } {
  const unlockedIds = new Set(unlocked.map((achievement) => achievement.id))
  const next = [...unlocked]
  const newlyUnlocked: UnlockedAchievement[] = []

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.has(def.id)) continue
    if (def.condition(context)) {
      const entry = { id: def.id, unlockedAt: new Date().toISOString() }
      newlyUnlocked.push(entry)
      next.push(entry)
    }
  }

  return { unlocked: next, newlyUnlocked }
}

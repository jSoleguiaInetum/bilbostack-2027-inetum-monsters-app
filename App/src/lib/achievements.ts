import { getContacts } from './contacts'
import { getBattles } from './battle'
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

const ACHIEVEMENTS_KEY = 'bilbostack_achievements'

function storageKey(userId: string): string {
  return `${ACHIEVEMENTS_KEY}_${userId}`
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

export function getUnlockedAchievements(userId: string): UnlockedAchievement[] {
  const data = localStorage.getItem(storageKey(userId))
  return data ? JSON.parse(data) : []
}

function saveUnlocked(userId: string, unlocked: UnlockedAchievement[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(unlocked))
}

export function buildContext(userId: string, metrics: PlayerMetrics): AchievementContext {
  const contacts = getContacts(userId)
  const battles = getBattles(userId)
  const archetypes = new Set(contacts.map(c => c.archetype))

  return {
    userId,
    metrics,
    contactCount: contacts.length,
    battleCount: battles.length,
    battleWins: battles.filter(b => b.outcome === 'win').length,
    uniqueArchetypesContacted: archetypes.size,
  }
}

export function checkAchievements(userId: string, metrics: PlayerMetrics): UnlockedAchievement[] {
  const ctx = buildContext(userId, metrics)
  const unlocked = getUnlockedAchievements(userId)
  const unlockedIds = new Set(unlocked.map(a => a.id))
  const newlyUnlocked: UnlockedAchievement[] = []

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedIds.has(def.id)) continue
    if (def.condition(ctx)) {
      const entry = { id: def.id, unlockedAt: new Date().toISOString() }
      newlyUnlocked.push(entry)
      unlocked.push(entry)
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlocked(userId, unlocked)
  }

  return newlyUnlocked
}

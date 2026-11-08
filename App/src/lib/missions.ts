import type { PlayerMetrics } from './metrics'

export type MissionType = 'base' | 'contextual' | 'qr'

export type MissionObjectiveType =
  | 'contacts'
  | 'battles'
  | 'battle_wins'
  | 'talks'
  | 'archetypes'
  | 'achievements'
  | 'expertise'
  | 'aura'

export interface MissionObjective {
  type: MissionObjectiveType
  target: number
}

export interface MissionReward {
  expertise: number
  auraTech: number
  objectId?: string
}

export interface Mission {
  id: string
  name: string
  description: string
  type: MissionType
  objective: MissionObjective
  reward: MissionReward
  isActive: boolean
}

export type MissionStatus = 'active' | 'completed'

export interface MissionCompletion {
  missionId: string
  completedAt: string
}

export interface MissionProgress {
  mission: Mission
  status: MissionStatus
  current: number
  target: number
  completedAt?: string
}

export interface MissionContext {
  metrics: PlayerMetrics
  contactCount: number
  battleCount: number
  battleWins: number
  talkCount: number
  uniqueArchetypesContacted: number
  achievementCount: number
}

export interface MissionCheckResult {
  completed: Mission[]
  metrics: PlayerMetrics
  grantedObjectIds: string[]
}

export const MISSION_DEFINITIONS: Mission[] = [
  {
    id: 'mission-first-contact',
    name: 'Primer movimiento',
    description: 'Añade tu primer contacto al pasar el QR.',
    type: 'base',
    objective: { type: 'contacts', target: 1 },
    reward: { expertise: 0, auraTech: 3 },
    isActive: true,
  },
  {
    id: 'mission-first-battle',
    name: 'Primer combate',
    description: 'Juega tu primer combate de preguntas.',
    type: 'base',
    objective: { type: 'battles', target: 1 },
    reward: { expertise: 2, auraTech: 1 },
    isActive: true,
  },
  {
    id: 'mission-first-talk',
    name: 'Primera charla',
    description: 'Haz check-in en una charla de BilboStack.',
    type: 'base',
    objective: { type: 'talks', target: 1 },
    reward: { expertise: 0, auraTech: 5 },
    isActive: true,
  },
  {
    id: 'mission-network-3',
    name: 'Red de tres',
    description: 'Consigue 3 contactos.',
    type: 'base',
    objective: { type: 'contacts', target: 3 },
    reward: { expertise: 3, auraTech: 3, objectId: 'object-09' },
    isActive: true,
  },
  {
    id: 'mission-diverse-3',
    name: 'Arquitecto de red',
    description: 'Conecta con 3 arquetipos distintos.',
    type: 'base',
    objective: { type: 'archetypes', target: 3 },
    reward: { expertise: 0, auraTech: 5, objectId: 'object-16' },
    isActive: true,
  },
  {
    id: 'mission-expert-20',
    name: 'Mente experta',
    description: 'Alcanza 20 puntos de Expertise.',
    type: 'base',
    objective: { type: 'expertise', target: 20 },
    reward: { expertise: 0, auraTech: 5 },
    isActive: true,
  },
  {
    id: 'mission-achiever-1',
    name: 'Cazador de logros',
    description: 'Desbloquea tu primer logro.',
    type: 'base',
    objective: { type: 'achievements', target: 1 },
    reward: { expertise: 0, auraTech: 2 },
    isActive: true,
  },
]

export function missionProgressValue(
  objective: MissionObjective,
  context: MissionContext,
): number {
  switch (objective.type) {
    case 'contacts':
      return context.contactCount
    case 'battles':
      return context.battleCount
    case 'battle_wins':
      return context.battleWins
    case 'talks':
      return context.talkCount
    case 'archetypes':
      return context.uniqueArchetypesContacted
    case 'achievements':
      return context.achievementCount
    case 'expertise':
      return context.metrics.expertise
    case 'aura':
      return context.metrics.auraTech
  }
}

export function evaluateMissionProgress(
  completions: readonly MissionCompletion[],
  context: MissionContext,
  definitions: readonly Mission[] = MISSION_DEFINITIONS,
): MissionProgress[] {
  const completedById = new Map(completions.map(completion => [completion.missionId, completion]))

  return definitions
    .filter(mission => mission.isActive || completedById.has(mission.id))
    .map(mission => {
      const completion = completedById.get(mission.id)
      return {
        mission,
        status: completion ? 'completed' : 'active',
        current: missionProgressValue(mission.objective, context),
        target: mission.objective.target,
        completedAt: completion?.completedAt,
      }
    })
}

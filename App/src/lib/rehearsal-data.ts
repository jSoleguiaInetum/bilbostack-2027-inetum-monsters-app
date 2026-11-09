import type { User } from '../auth/types'
import type { Archetype } from '../monster/types'
import type { UnlockedAchievement } from './achievements'
import type { BattleResult } from './battle'
import type { CheckIn } from './checkins'
import type { Contact, ContactOrigin } from './contacts'
import type { MetricsEntry, PlayerMetrics } from './metrics'
import type { MissionCompletion } from './missions'
import type { UserObject } from './objects'

/**
 * Datos de ensayo para el dress rehearsal (TODO.md, Fase 4).
 *
 * Todo es determinista: la misma semilla produce siempre el mismo dataset.
 * Asi el ensayo es reproducible y los tests pueden fijar expectativas exactas.
 */

export const REHEARSAL_USER_PREFIX = 'rehearsal-user-'
export const REHEARSAL_ID_PREFIX = 'rehearsal-'

const BASE_TIME = '2027-01-10T09:00:00.000Z'

const ARCHETYPES: Archetype[] = [
  'developer',
  'ux',
  'devops',
  'qa',
  'product',
  'management',
  'ia',
  'multiclass',
]

const FIRST_NAMES = [
  'Lucía',
  'Marcos',
  'Sofía',
  'Diego',
  'Elena',
  'Javier',
  'Carmen',
  'Pablo',
  'Marta',
  'Álvaro',
  'Nerea',
  'Sergio',
  'Irene',
  'Rubén',
  'Claudia',
  'Andrés',
  'Julia',
  'Gonzalo',
  'Paula',
  'Manuel',
]

const LAST_NAMES = [
  'Fernández',
  'García',
  'Ruiz',
  'Torres',
  'Vidal',
  'Sanz',
  'Ortiz',
  'Herrera',
  'Núñez',
  'Iglesias',
]

const CONTACT_ORIGINS: ContactOrigin[] = ['contact', 'battle_win', 'battle_loss', 'battle_draw']

/** Logros desbloqueables por el asistente del ensayo. */
export const REHEARSAL_ACHIEVEMENT_IDS = [
  'first-contact',
  'networker',
  'first-blood',
  'expert',
] as const

/** Objetos de inventario entregados al asistente del ensayo. */
export const REHEARSAL_OBJECT_IDS = ['object-01', 'object-02', 'object-03', 'object-07'] as const

/** Misiones que el asistente del ensayo ya completó. */
export const REHEARSAL_MISSION_IDS = ['mission-first-contact', 'mission-first-battle'] as const

function offsetMinutes(minutes: number): string {
  return new Date(Date.parse(BASE_TIME) + minutes * 60_000).toISOString()
}

function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '')
}

export function rehearsalUserId(index: number): string {
  return `${REHEARSAL_USER_PREFIX}${String(index + 1).padStart(3, '0')}`
}

/**
 * Genera los usuarios ficticios del ensayo. Los ids llevan prefijo para poder
 * identificarlos y limpiarlos sin tocar a los usuarios reales.
 */
export function buildRehearsalUsers(count: number): User[] {
  const users: User[] = []
  for (let index = 0; index < count; index++) {
    const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[index % LAST_NAMES.length]}`
    users.push({
      id: rehearsalUserId(index),
      email: `${slug(name)}.${index}@rehearsal.bilbostack.test`,
      name,
      archetype: ARCHETYPES[index % ARCHETYPES.length],
      role: 'participant',
      createdAt: offsetMinutes(index),
    })
  }
  return users
}

/** Métricas del usuario actual del ensayo: evolución media y historial visible. */
export function buildRehearsalMetrics(): PlayerMetrics {
  const history: MetricsEntry[] = [
    { action: 'register', expertise: 1, auraTech: 1, timestamp: offsetMinutes(0) },
    { action: 'contact_add', expertise: 0, auraTech: 2, timestamp: offsetMinutes(4) },
    { action: 'contact_diverse', expertise: 0, auraTech: 3, timestamp: offsetMinutes(9) },
    { action: 'question_correct', expertise: 3, auraTech: 0, timestamp: offsetMinutes(15) },
    { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: offsetMinutes(22) },
    { action: 'talk_checkin', expertise: 0, auraTech: 5, timestamp: offsetMinutes(31) },
    { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: offsetMinutes(44) },
    { action: 'achievement', expertise: 0, auraTech: 2, timestamp: offsetMinutes(52) },
  ]

  const expertise = history.reduce((total, entry) => total + entry.expertise, 0)
  const auraTech = history.reduce((total, entry) => total + entry.auraTech, 0)

  return { expertise, auraTech, history }
}

/** Contactos del usuario actual del ensayo, con orígenes variados. */
export function buildRehearsalContacts(users: User[]): Contact[] {
  return users.slice(0, 5).map((user, index) => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    archetype: user.archetype,
    connectedAt: offsetMinutes(5 + index * 3),
    origin: CONTACT_ORIGINS[index % CONTACT_ORIGINS.length],
  }))
}

/** Combate simulado del usuario actual del ensayo. */
export function buildRehearsalBattles(users: User[]): BattleResult[] {
  const opponent = users[0]
  if (!opponent) return []

  return [
    {
      id: `${REHEARSAL_ID_PREFIX}battle-1`,
      opponentId: opponent.id,
      opponentName: opponent.name,
      opponentArchetype: opponent.archetype,
      rounds: [
        {
          playerCorrect: true,
          playerTimeMs: 3100,
          opponentCorrect: false,
          opponentTimeMs: 5200,
          winner: 'player',
        },
        {
          playerCorrect: true,
          playerTimeMs: 2400,
          opponentCorrect: true,
          opponentTimeMs: 2600,
          winner: 'player',
        },
        {
          playerCorrect: false,
          playerTimeMs: 4100,
          opponentCorrect: true,
          opponentTimeMs: 3900,
          winner: 'opponent',
        },
      ],
      outcome: 'win',
      timestamp: offsetMinutes(22),
    },
  ]
}

export function buildRehearsalAchievements(): UnlockedAchievement[] {
  return REHEARSAL_ACHIEVEMENT_IDS.map((id, index) => ({
    id,
    unlockedAt: offsetMinutes(10 + index * 8),
  }))
}

export function buildRehearsalInventory(): UserObject[] {
  return REHEARSAL_OBJECT_IDS.map((objectId, index) => ({
    objectId,
    obtainedAt: offsetMinutes(12 + index * 6),
    source: index % 2 === 0 ? 'achievement' : 'qr',
  }))
}

export function buildRehearsalMissions(): MissionCompletion[] {
  return REHEARSAL_MISSION_IDS.map((missionId, index) => ({
    missionId,
    completedAt: offsetMinutes(18 + index * 11),
  }))
}

export function buildRehearsalCheckIns(talks: { talkId: string; title: string; speaker: string }[]): CheckIn[] {
  return talks.slice(0, 2).map((talk, index) => ({
    talkId: talk.talkId,
    title: talk.title,
    speaker: talk.speaker,
    checkedInAt: offsetMinutes(28 + index * 4),
  }))
}

/**
 * Dataset completo de un usuario ficticio del ensayo: sirve para poblar
 * rankings y dashboard con volumen realista.
 */
export function buildRehearsalUserDataset(users: User[], index: number) {
  const user = users[index]
  const others = users.filter((candidate) => candidate.id !== user.id)
  const contactCount = 3 + (index % 4)
  const history: MetricsEntry[] = [
    { action: 'register', expertise: 1, auraTech: 1, timestamp: offsetMinutes(index) },
    { action: 'contact_add', expertise: 0, auraTech: 2, timestamp: offsetMinutes(index + 2) },
    { action: 'question_correct', expertise: 3, auraTech: 0, timestamp: offsetMinutes(index + 5) },
  ]

  return {
    user,
    metrics: {
      expertise: history.reduce((total, entry) => total + entry.expertise, 0),
      auraTech: history.reduce((total, entry) => total + entry.auraTech, 0),
      history,
    } satisfies PlayerMetrics,
    contacts: others.slice(0, contactCount).map((contact, position) => ({
      userId: contact.id,
      name: contact.name,
      email: contact.email,
      archetype: contact.archetype,
      connectedAt: offsetMinutes(index + position),
      origin: CONTACT_ORIGINS[position % CONTACT_ORIGINS.length],
    })) satisfies Contact[],
    battles: [] as BattleResult[],
  }
}

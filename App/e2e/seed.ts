import type { Page } from '@playwright/test'

type Archetype = 'developer' | 'ux' | 'devops' | 'qa' | 'product' | 'management' | 'ia' | 'multiclass'

interface SeedUser {
  id: string
  email: string
  name: string
  archetype: Archetype
  role: 'participant' | 'admin'
  createdAt: string
}

export const TEST_USER: SeedUser = {
  id: 'e2e-user-000',
  email: 'ada@bilbostack.test',
  name: 'Ada E2E',
  archetype: 'developer',
  role: 'admin',
  createdAt: '2027-01-01T09:00:00.000Z',
}

const OTHER_USERS: SeedUser[] = [
  { id: 'e2e-user-001', email: 'grace@bilbostack.test', name: 'Grace Ops', archetype: 'devops', role: 'participant', createdAt: '2027-01-01T09:05:00.000Z' },
  { id: 'e2e-user-002', email: 'linus@bilbostack.test', name: 'Linus QA', archetype: 'qa', role: 'participant', createdAt: '2027-01-01T09:06:00.000Z' },
  { id: 'e2e-user-003', email: 'alan@bilbostack.test', name: 'Alan UX', archetype: 'ux', role: 'participant', createdAt: '2027-01-01T09:07:00.000Z' },
  { id: 'e2e-user-004', email: 'edsger@bilbostack.test', name: 'Edsger PM', archetype: 'product', role: 'participant', createdAt: '2027-01-01T09:08:00.000Z' },
  { id: 'e2e-user-005', email: 'barbara@bilbostack.test', name: 'Barbara Mng', archetype: 'management', role: 'participant', createdAt: '2027-01-01T09:09:00.000Z' },
  { id: 'e2e-user-006', email: 'andrej@bilbostack.test', name: 'Andrej IA', archetype: 'ia', role: 'participant', createdAt: '2027-01-01T09:10:00.000Z' },
  { id: 'e2e-user-007', email: 'alan-k@bilbostack.test', name: 'Alan Kay', archetype: 'multiclass', role: 'participant', createdAt: '2027-01-01T09:11:00.000Z' },
]

const ALL_USERS = [TEST_USER, ...OTHER_USERS]

const METRICS_BY_USER: Record<string, { expertise: number; auraTech: number }> = {
  'e2e-user-000': { expertise: 34, auraTech: 27 },
  'e2e-user-001': { expertise: 51, auraTech: 44 },
  'e2e-user-002': { expertise: 28, auraTech: 39 },
  'e2e-user-003': { expertise: 19, auraTech: 33 },
  'e2e-user-004': { expertise: 22, auraTech: 18 },
  'e2e-user-005': { expertise: 15, auraTech: 21 },
  'e2e-user-006': { expertise: 37, auraTech: 12 },
  'e2e-user-007': { expertise: 9, auraTech: 26 },
}

function metricsEntry(userId: string) {
  const base = METRICS_BY_USER[userId] ?? { expertise: 0, auraTech: 0 }
  return {
    expertise: base.expertise,
    auraTech: base.auraTech,
    history: [
      {
        action: 'contact',
        expertise: 0,
        auraTech: 2,
        timestamp: '2027-01-01T10:00:00.000Z',
      },
    ],
  }
}

function contactsFor(userId: string) {
  const others = ALL_USERS.filter((user) => user.id !== userId)
  const count = Math.min(others.length, 3 + (Number(userId.slice(-1)) % 3))
  return others.slice(0, count).map((contact, index) => ({
    userId: contact.id,
    name: contact.name,
    email: contact.email,
    archetype: contact.archetype,
    connectedAt: '2027-01-01T10:0' + index + ':00.000Z',
    origin: index % 2 === 0 ? 'contact' : 'battle_win',
  }))
}

function battlesFor(userId: string) {
  const others = ALL_USERS.filter((user) => user.id !== userId)
  return others.slice(0, 2).map((opponent, index) => ({
    id: `battle-${userId}-${index}`,
    opponentId: opponent.id,
    opponentName: opponent.name,
    opponentArchetype: opponent.archetype,
    rounds: [
      {
        playerCorrect: index === 0,
        playerTimeMs: 3200,
        opponentCorrect: index !== 0,
        opponentTimeMs: 4100,
        winner: index === 0 ? 'player' : 'opponent',
      },
    ],
    outcome: index === 0 ? 'win' : 'loss',
    timestamp: '2027-01-01T11:0' + index + ':00.000Z',
  }))
}

/**
 * Devuelve el mapa `clave de localStorage -> valor JSON` para sembrar el
 * adaptador `local` de la app. Las claves siguen el contrato real de
 * `src/data/local/storage.ts`.
 */
export function buildSeed(options: { withSession?: boolean } = {}): Record<string, string> {
  const withSession = options.withSession !== false
  const seed: Record<string, string> = {}

  seed['bilbostack_users'] = JSON.stringify(ALL_USERS)
  seed['bilbostack_feature_flags'] = JSON.stringify({ inventory: true, missions: true })

  for (const user of ALL_USERS) {
    seed[`bilbostack_metrics_${user.id}`] = JSON.stringify(metricsEntry(user.id))
    seed[`bilbostack_contacts_${user.id}`] = JSON.stringify(contactsFor(user.id))
    seed[`bilbostack_battles_${user.id}`] = JSON.stringify(battlesFor(user.id))
    seed[`bilbostack_fought_${user.id}`] = JSON.stringify(
      battlesFor(user.id).map((battle) => battle.opponentId),
    )
  }

  seed[`bilbostack_achievements_${TEST_USER.id}`] = JSON.stringify([
    { id: 'first-contact', unlockedAt: '2027-01-01T10:00:00.000Z' },
    { id: 'networker', unlockedAt: '2027-01-01T10:10:00.000Z' },
    { id: 'expert', unlockedAt: '2027-01-01T10:20:00.000Z' },
  ])
  seed[`bilbostack_inventory_${TEST_USER.id}`] = JSON.stringify([
    { objectId: 'object-01', obtainedAt: '2027-01-01T10:00:00.000Z', source: 'achievement' },
    { objectId: 'object-02', obtainedAt: '2027-01-01T10:10:00.000Z', source: 'achievement' },
    { objectId: 'object-07', obtainedAt: '2027-01-01T10:20:00.000Z', source: 'qr' },
  ])
  seed[`bilbostack_checkins_${TEST_USER.id}`] = JSON.stringify([])
  seed[`bilbostack_missions_${TEST_USER.id}`] = JSON.stringify([])

  if (withSession) {
    seed['bilbostack_session'] = JSON.stringify(TEST_USER)
  }

  return seed
}

/**
 * Siembra el estado local antes de la primera navegacion. `addInitScript` corre
 * en cada documento antes de que corra el script de la app, que es lo que
 * necesita `AuthProvider` para restaurar la sesion.
 */
export async function seedLocalStorage(page: Page, options: { withSession?: boolean } = {}) {
  const seed = buildSeed(options)
  await page.addInitScript((entries: Record<string, string>) => {
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value)
    }
  }, seed)
}

/** Errores de consola que no son fallos de la app. */
const IGNORED_CONSOLE_PATTERNS = [
  /favicon/i,
  /Download the React DevTools/i,
  /fonts\.googleapis\.com/i,
  /fonts\.gstatic\.com/i,
]

export function isRelevantConsoleError(text: string): boolean {
  return !IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))
}

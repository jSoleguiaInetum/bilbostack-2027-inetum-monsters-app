import { describe, expect, it } from 'vitest'
import {
  buildRehearsalAchievements,
  buildRehearsalBattles,
  buildRehearsalCheckIns,
  buildRehearsalContacts,
  buildRehearsalInventory,
  buildRehearsalMetrics,
  buildRehearsalMissions,
  buildRehearsalUserDataset,
  buildRehearsalUsers,
  REHEARSAL_USER_PREFIX,
} from './rehearsal-data'

describe('rehearsal-data', () => {
  it('genera la cantidad de usuarios pedidos con ids prefijados', () => {
    const users = buildRehearsalUsers(24)

    expect(users).toHaveLength(24)
    expect(users.every((user) => user.id.startsWith(REHEARSAL_USER_PREFIX))).toBe(true)
    expect(new Set(users.map((user) => user.id)).size).toBe(24)
    expect(new Set(users.map((user) => user.email)).size).toBe(24)
  })

  it('es determinista: dos llamadas producen el mismo dataset', () => {
    expect(buildRehearsalUsers(10)).toEqual(buildRehearsalUsers(10))
    expect(buildRehearsalMetrics()).toEqual(buildRehearsalMetrics())
  })

  it('reparte los ocho arquetipos entre los usuarios', () => {
    const archetypes = new Set(buildRehearsalUsers(16).map((user) => user.archetype))

    expect(archetypes.size).toBe(8)
  })

  it('crea usuarios ficticios con rol participante, nunca admin', () => {
    expect(buildRehearsalUsers(5).every((user) => user.role === 'participant')).toBe(true)
  })

  it('calcula las metricas como suma del historial', () => {
    const metrics = buildRehearsalMetrics()
    const expertise = metrics.history.reduce((total, entry) => total + entry.expertise, 0)
    const auraTech = metrics.history.reduce((total, entry) => total + entry.auraTech, 0)

    expect(metrics.expertise).toBe(expertise)
    expect(metrics.auraTech).toBe(auraTech)
  })

  it('deja al asistente del ensayo con una evolucion visible', () => {
    const metrics = buildRehearsalMetrics()

    // Umbral de evolucion II (20 puntos).
    expect(metrics.expertise + metrics.auraTech).toBeGreaterThanOrEqual(20)
  })

  it('genera contactos con origenes variados y sin repetir usuario', () => {
    const users = buildRehearsalUsers(10)
    const contacts = buildRehearsalContacts(users)

    expect(contacts.length).toBeGreaterThan(0)
    expect(new Set(contacts.map((contact) => contact.userId)).size).toBe(contacts.length)
    expect(contacts.every((contact) => contact.origin !== undefined)).toBe(true)
  })

  it('genera un combate resuelto a favor del asistente', () => {
    const users = buildRehearsalUsers(3)
    const battles = buildRehearsalBattles(users)

    expect(battles).toHaveLength(1)
    expect(battles[0].outcome).toBe('win')
    expect(battles[0].rounds).toHaveLength(3)
  })

  it('no genera combate si no hay oponentes', () => {
    expect(buildRehearsalBattles([])).toEqual([])
  })

  it('usa ids de logros y objetos que existen en el dominio', () => {
    expect(buildRehearsalAchievements().map((entry) => entry.id)).toContain('first-contact')
    expect(buildRehearsalInventory().map((entry) => entry.objectId)).toContain('object-01')
    expect(buildRehearsalMissions().map((entry) => entry.missionId)).toContain('mission-first-contact')
  })

  it('mapea los check-ins de charlas reales', () => {
    const checkIns = buildRehearsalCheckIns([
      { talkId: 'talk-1', title: 'Charla', speaker: 'Ponente' },
      { talkId: 'talk-2', title: 'Charla 2', speaker: 'Ponente 2' },
      { talkId: 'talk-3', title: 'Charla 3', speaker: 'Ponente 3' },
    ])

    expect(checkIns).toHaveLength(2)
    expect(checkIns[0].talkId).toBe('talk-1')
  })

  it('el dataset de un usuario ficticio no lo incluye a si mismo en contactos', () => {
    const users = buildRehearsalUsers(8)
    const dataset = buildRehearsalUserDataset(users, 3)

    expect(dataset.contacts.every((contact) => contact.userId !== dataset.user.id)).toBe(true)
    expect(dataset.metrics.history.length).toBeGreaterThan(0)
  })
})

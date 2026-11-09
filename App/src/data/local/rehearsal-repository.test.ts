import { beforeEach, describe, expect, it } from 'vitest'
import { localRehearsalRepository } from './rehearsal-repository'
import { STORAGE_KEYS, readJson, userKey, writeJson } from './storage'
import type { User } from '../../auth/types'
import { REHEARSAL_USER_PREFIX } from '../../lib/rehearsal-data'

const REAL_USER: User = {
  id: 'real-user-1',
  email: 'real@example.com',
  name: 'Real User',
  archetype: 'developer',
  role: 'admin',
  createdAt: '2027-01-01T09:00:00.000Z',
}

beforeEach(() => {
  localStorage.clear()
  writeJson(STORAGE_KEYS.users, [REAL_USER])
})

describe('local rehearsal repository', () => {
  it('siembra usuarios ficticios sin duplicar los ya existentes', async () => {
    const result = await localRehearsalRepository.seed(REAL_USER.id, { userCount: 5 })

    const users = readJson<User[]>(STORAGE_KEYS.users, [])
    expect(result.users).toBe(5)
    expect(users).toHaveLength(6)
    expect(users.filter((user) => user.id === REAL_USER.id)).toHaveLength(1)
  })

  it('es idempotente: sembrar dos veces no duplica usuarios', async () => {
    await localRehearsalRepository.seed(REAL_USER.id, { userCount: 4 })
    const second = await localRehearsalRepository.seed(REAL_USER.id, { userCount: 4 })

    const users = readJson<User[]>(STORAGE_KEYS.users, [])
    expect(second.users).toBe(0)
    expect(users).toHaveLength(5)
  })

  it('enriquece al usuario actual con metricas, contactos, logros y objetos', async () => {
    await localRehearsalRepository.seed(REAL_USER.id, { userCount: 6 })

    const metrics = readJson<{ expertise: number; auraTech: number }>(
      userKey(STORAGE_KEYS.metrics, REAL_USER.id),
      { expertise: 0, auraTech: 0 },
    )
    const contacts = readJson<unknown[]>(userKey(STORAGE_KEYS.contacts, REAL_USER.id), [])
    const achievements = readJson<unknown[]>(userKey(STORAGE_KEYS.achievements, REAL_USER.id), [])
    const inventory = readJson<unknown[]>(userKey(STORAGE_KEYS.inventory, REAL_USER.id), [])

    expect(metrics.expertise + metrics.auraTech).toBeGreaterThanOrEqual(20)
    expect(contacts.length).toBeGreaterThan(0)
    expect(achievements.length).toBeGreaterThan(0)
    expect(inventory.length).toBeGreaterThan(0)
  })

  it('siembra tambien sin sesion activa', async () => {
    const result = await localRehearsalRepository.seed(null, { userCount: 3 })

    expect(result.users).toBe(3)
    expect(result.enrichedCurrentUser).toBe(false)
    expect(readJson<User[]>(STORAGE_KEYS.users, [])).toHaveLength(4)
  })

  it('reset elimina solo los usuarios de ensayo y conserva los reales', async () => {
    await localRehearsalRepository.seed(REAL_USER.id, { userCount: 5 })
    await localRehearsalRepository.reset()

    const users = readJson<User[]>(STORAGE_KEYS.users, [])
    expect(users).toHaveLength(1)
    expect(users[0].id).toBe(REAL_USER.id)
    expect(users.some((user) => user.id.startsWith(REHEARSAL_USER_PREFIX))).toBe(false)
  })

  it('reset limpia los datos por usuario de los usuarios de ensayo', async () => {
    await localRehearsalRepository.seed(REAL_USER.id, { userCount: 3 })
    const fakeId = readJson<User[]>(STORAGE_KEYS.users, [])[1].id
    await localRehearsalRepository.reset()

    expect(localStorage.getItem(userKey(STORAGE_KEYS.metrics, fakeId))).toBeNull()
  })

  it('guarda y lista el feedback del ensayo', async () => {
    const entry = await localRehearsalRepository.saveFeedback({
      rating: 4,
      flow: 'qr',
      device: 'iPhone SE',
      comment: 'El escaneo tardó un poco',
      blocking: false,
    })

    const entries = await localRehearsalRepository.listFeedback()
    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe(entry.id)
    expect(entries[0].rating).toBe(4)
    expect(entries[0].createdAt).toBeTruthy()
  })

  it('rechaza puntuaciones fuera de rango', async () => {
    await expect(
      localRehearsalRepository.saveFeedback({
        rating: 9,
        flow: 'qr',
        device: 'iPhone SE',
        comment: '',
        blocking: false,
      }),
    ).rejects.toThrow('La puntuacion debe estar entre 1 y 5')
  })
})

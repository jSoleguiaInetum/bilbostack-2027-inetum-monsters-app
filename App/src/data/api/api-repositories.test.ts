import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApiRepositories } from './index'
import { HttpClient } from './http-client'

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

const fetchMock = vi.fn()
let repositories: ReturnType<typeof createApiRepositories>

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  repositories = createApiRepositories(new HttpClient('https://api.test'))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api auth repository', () => {
  it('posts registration data and maps the user', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      archetype: 'developer',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
    }))

    const user = await repositories.auth.signUpWithEmail(
      'test@example.com',
      'secret',
      'Test',
      'developer',
    )

    expect(user).toMatchObject({ id: 'user-1', archetype: 'developer', role: 'admin' })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/auth/register')
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'test@example.com',
      password: 'secret',
      name: 'Test',
      archetype: 'developer',
    })
  })

  it('returns null when there is no session', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'No session' }, 401))

    expect(await repositories.auth.getSession()).toBeNull()
  })
})

describe('api domain repositories', () => {
  it('maps metrics rewards', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      expertise: 5,
      auraTech: 3,
      history: [{
        action: 'battle_win',
        expertise: 5,
        auraTech: 3,
        timestamp: '2026-01-01T00:00:00.000Z',
      }],
    }))

    const metrics = await repositories.metrics.addReward('user-1', 'battle_win')

    expect(metrics).toMatchObject({ expertise: 5, auraTech: 3 })
    expect(metrics.history).toHaveLength(1)
  })

  it('derives fought opponents from the battle history', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([
      { id: 'b1', opponentId: 'o1', opponentName: 'One', opponentArchetype: 'ux', rounds: [], outcome: 'win', timestamp: 't1' },
      { id: 'b2', opponentId: 'o2', opponentName: 'Two', opponentArchetype: 'qa', rounds: [], outcome: 'loss', timestamp: 't2' },
    ]))

    expect(await repositories.battles.getFoughtOpponents('user-1')).toEqual(['o1', 'o2'])
  })

  it('maps contact origins and handles conflicts as false', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([{
      userId: 'target-1',
      name: 'Target',
      email: 'target@example.com',
      archetype: 'ux',
      connectedAt: '2026-01-01T00:00:00.000Z',
      origin: 'battle_win',
    }]))
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Contact already exists' }, 409))

    const contacts = await repositories.contacts.list('user-1')
    const added = await repositories.contacts.add('user-1', {
      userId: 'target-1',
      name: 'Target',
      email: 'target@example.com',
      archetype: 'ux',
    })

    expect(contacts[0].origin).toBe('battle_win')
    expect(added).toBe(false)
  })

  it('maps rankings with the current user position', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      category: 'aura',
      entries: [{
        rank: 1,
        userId: 'user-1',
        name: 'Alice',
        archetype: 'developer',
        score: 16,
      }],
      currentUser: {
        rank: 3,
        userId: 'user-3',
        name: 'Carla',
        archetype: 'qa',
        score: 6,
      },
    }))

    const ranking = await repositories.rankings.getByCategory('aura', {
      limit: 1,
      currentUserId: 'user-3',
    })

    expect(ranking.entries[0]).toMatchObject({ userId: 'user-1', score: 16 })
    expect(ranking.currentUser).toMatchObject({ rank: 3, userId: 'user-3' })
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/rankings?category=aura&limit=1&userId=user-3')
  })

  it('maps the public dashboard overview', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      stats: {
        totalUsers: 3,
        totalBattles: 5,
        totalContacts: 4,
        totalAchievements: 6,
      },
      rankings: {
        aura: [{
          rank: 1,
          userId: 'user-1',
          name: 'Alice',
          archetype: 'developer',
          score: 16,
        }],
      },
      recentEvolutions: [{
        userId: 'user-2',
        name: 'Bob',
        archetype: 'ux',
        stage: 1,
        totalPoints: 22,
        evolvedAt: '2026-01-01T12:20:00.000Z',
      }],
    }))

    const dashboard = await repositories.dashboard.getOverview({
      rankingsLimit: 1,
      evolutionsLimit: 2,
    })

    expect(dashboard.stats).toEqual({
      totalUsers: 3,
      totalBattles: 5,
      totalContacts: 4,
      totalAchievements: 6,
    })
    expect(dashboard.rankings.aura).toHaveLength(1)
    expect(dashboard.rankings.expertise).toEqual([])
    expect(dashboard.rankings.contacts).toEqual([])
    expect(dashboard.rankings.wins).toEqual([])
    expect(dashboard.recentEvolutions[0]).toMatchObject({
      userId: 'user-2',
      stage: 1,
      totalPoints: 22,
    })

    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/dashboard/public?rankingsLimit=1&evolutionsLimit=2')
  })

  it('updates a user role', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      archetype: 'developer',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
    }))

    const user = await repositories.users.updateRole('user-1', 'admin')

    expect(user.role).toBe('admin')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/users/user-1/role')
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' })
    expect(JSON.parse(init.body as string)).toEqual({ role: 'admin' })
  })

  it('maps the admin dashboard overview', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      stats: {
        totalUsers: 3,
        totalBattles: 5,
        totalContacts: 4,
        totalAchievements: 6,
        averageExpertise: 12.5,
        averageAuraTech: 8,
      },
    }))

    const dashboard = await repositories.dashboard.getAdminOverview()

    expect(dashboard.stats).toEqual({
      totalUsers: 3,
      totalBattles: 5,
      totalContacts: 4,
      totalAchievements: 6,
      averageExpertise: 12.5,
      averageAuraTech: 8,
    })

    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/dashboard/admin')
  })

  it('maps object definitions, normalizes rarity and filters inactive objects', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([
      {
        id: 'object-01',
        name: 'Teclado Mecánico',
        description: 'Teclado compacto',
        rarity: 'Inusual',
        benefit: 'Estilo',
        icon_url: '/monster-assets/objects/object-01.svg',
        origin: 'BilboStack',
      },
      {
        id: 'object-02',
        name: 'Paleta de Diseño',
        description: 'Paleta digital',
        rarity: 'Epico',
        benefit: 'Estilo',
        benefit_type: 'Cosmetic',
        benefit_value: 0,
        icon_url: '/monster-assets/objects/object-02.svg',
        origin: 'BilboStack',
        is_active: true,
      },
      {
        id: 'object-03',
        name: 'Objeto retirado',
        description: 'Ya no se entrega',
        rarity: 'Inusual',
        benefit: '',
        icon_url: '/monster-assets/objects/object-03.svg',
        origin: 'BilboStack',
        is_active: false,
      },
    ]))

    const definitions = await repositories.inventory.listDefinitions()

    expect(definitions).toHaveLength(2)
    expect(definitions[0]).toMatchObject({
      id: 'object-01',
      benefitType: 'Special',
      benefitValue: 0,
      isActive: true,
    })
    expect(definitions[1].rarity).toBe('Épico')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/objects')
  })

  it('maps the owned inventory and defaults unknown sources', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([
      { object_id: 'object-01', obtained_at: '2026-01-01T00:00:00.000Z', source: 'qr' },
      { object_id: 'object-02', obtained_at: '2026-01-02T00:00:00.000Z', source: 'desconocido' },
    ]))

    const owned = await repositories.inventory.listOwned('user-1')

    expect(owned[0]).toEqual({
      objectId: 'object-01',
      obtainedAt: '2026-01-01T00:00:00.000Z',
      source: 'qr',
    })
    expect(owned[1].source).toBe('achievement')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/users/user-1/inventory')
  })

  it('derives has from the owned inventory', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([
      { object_id: 'object-01', obtained_at: '2026-01-01T00:00:00.000Z', source: 'qr' },
    ]))
    fetchMock.mockResolvedValueOnce(jsonResponse([]))

    expect(await repositories.inventory.has('user-1', 'object-01')).toBe(true)
    expect(await repositories.inventory.has('user-1', 'object-01')).toBe(false)
  })

  it('posts new inventory objects and handles conflicts as false', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 201))
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Object already owned' }, 409))

    expect(await repositories.inventory.add('user-1', {
      objectId: 'object-01',
      source: 'qr',
    })).toBe(true)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/users/user-1/inventory')
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(init.body as string)).toEqual({
      objectId: 'object-01',
      source: 'qr',
    })

    expect(await repositories.inventory.add('user-1', {
      objectId: 'object-01',
      source: 'qr',
    })).toBe(false)
  })

  it('propagates inventory validation errors', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Invalid object' }, 422))

    await expect(repositories.inventory.add('user-1', {
      objectId: 'missing',
      source: 'qr',
    })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('maps the mission progress list', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([
      {
        mission: {
          id: 'mission-first-contact',
          name: 'Primer movimiento',
          description: 'Añade tu primer contacto',
          type: 'base',
          objective: { type: 'contacts', target: 1 },
          reward: { expertise: 0, auraTech: 3, objectId: null },
          isActive: true,
        },
        status: 'completed',
        current: 1,
        target: 1,
        completedAt: '2026-01-01T10:00:00.000Z',
      },
      {
        mission: {
          id: 'mission-unknown',
          name: 'Desconocida',
          type: 'weird',
          objective: { type: 'unknown', target: 0 },
          reward: {},
        },
        status: 'active',
      },
    ]))

    const progress = await repositories.missions.list('user-1')

    expect(progress[0]).toMatchObject({
      mission: {
        id: 'mission-first-contact',
        type: 'base',
        objective: { type: 'contacts', target: 1 },
        reward: { expertise: 0, auraTech: 3 },
      },
      status: 'completed',
      current: 1,
      target: 1,
    })
    expect(progress[0].mission.reward.objectId).toBeUndefined()
    expect(progress[1]).toMatchObject({
      mission: {
        type: 'base',
        objective: { type: 'contacts', target: 1 },
        isActive: true,
      },
      status: 'active',
      current: 0,
      target: 1,
    })
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/users/user-1/missions')
  })

  it('checks missions and maps the granted objects and metrics', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      completed: [{
        id: 'mission-network-3',
        name: 'Red de tres',
        description: 'Consigue 3 contactos',
        type: 'base',
        objective: { type: 'contacts', target: 3 },
        reward: { expertise: 3, auraTech: 3, objectId: 'object-09' },
        isActive: true,
      }],
      metrics: {
        expertise: 3,
        auraTech: 8,
        history: [{
          action: 'mission_complete',
          expertise: 3,
          auraTech: 3,
          timestamp: '2026-01-01T10:00:00.000Z',
        }],
      },
      grantedObjectIds: ['object-09'],
    }))

    const result = await repositories.missions.checkAndComplete('user-1')

    expect(result.completed[0]).toMatchObject({
      id: 'mission-network-3',
      reward: { objectId: 'object-09' },
    })
    expect(result.metrics).toMatchObject({ expertise: 3, auraTech: 8 })
    expect(result.metrics.history).toHaveLength(1)
    expect(result.grantedObjectIds).toEqual(['object-09'])
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/users/user-1/missions/check')
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
  })

  it('maps the reward object returned by the achievement check', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([{
      id: 'first-contact',
      unlockedAt: '2026-01-01T10:00:00.000Z',
      objectId: 'object-01',
    }]))

    const unlocked = await repositories.achievements.checkAndUnlock('user-1', {
      userId: 'user-1',
      metrics: { expertise: 0, auraTech: 0, history: [] },
      contactCount: 1,
      battleCount: 0,
      battleWins: 0,
      uniqueArchetypesContacted: 1,
    })

    expect(unlocked[0]).toMatchObject({
      id: 'first-contact',
      objectId: 'object-01',
    })
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/users/user-1/achievements/check')
  })

  it('maps feature flags and falls back to the MVP defaults', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ inventory: true, unknown: true }))

    const flags = await repositories.featureFlags.list()

    expect(flags).toEqual({ inventory: true, missions: false })
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/feature-flags')
  })

  it('patches a feature flag and returns the updated map', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ inventory: false }))

    const flags = await repositories.featureFlags.set('inventory', false)

    expect(flags).toEqual({ inventory: false, missions: false })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/feature-flags/inventory')
    expect(init).toMatchObject({ method: 'PATCH', credentials: 'include' })
    expect(JSON.parse(init.body as string)).toEqual({ enabled: false })
  })

  it('maps network failures to a normalized DataError', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))

    await expect(repositories.talks.list()).rejects.toMatchObject({ code: 'NETWORK' })
  })
})

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

  it('maps network failures to a normalized DataError', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'))

    await expect(repositories.talks.list()).rejects.toMatchObject({ code: 'NETWORK' })
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { localAchievementsRepository } from './achievements-repository'
import { localAuthRepository } from './auth-repository'
import { localBattlesRepository } from './battles-repository'
import { localCheckInsRepository } from './checkins-repository'
import { localContactsRepository } from './contacts-repository'
import { localDashboardRepository } from './dashboard-repository'
import { localMetricsRepository } from './metrics-repository'
import { localRankingsRepository } from './rankings-repository'
import { localTalksRepository } from './talks-repository'
import { localUserRepository } from './user-repository'
import type { AchievementContext } from '../types'
import type { BattleResult } from '../../lib/battle'
import type { User } from '../../auth/types'
import { STORAGE_KEYS, userKey, writeJson } from './storage'

beforeEach(() => {
  localStorage.clear()
})

describe('local auth repository', () => {
  it('registers, normalizes the email and keeps the session', async () => {
    const user = await localAuthRepository.signUpWithEmail(
      '  Test@Example.com ',
      'secret',
      'Test',
      'developer',
    )

    expect(user.email).toBe('test@example.com')
    expect((await localAuthRepository.getSession())?.id).toBe(user.id)

    await localAuthRepository.signOut()
    expect(await localAuthRepository.getSession()).toBeNull()
  })

  it('rejects duplicate emails', async () => {
    await localAuthRepository.signUpWithEmail('duplicate@example.com', 'secret', 'First', 'ux')

    await expect(
      localAuthRepository.signUpWithEmail('DUPLICATE@example.com', 'secret', 'Second', 'qa'),
    ).rejects.toThrow('Email ya registrado')
  })

  it('bootstraps the first user as admin and the rest as participants', async () => {
    const first = await localAuthRepository.signUpWithEmail('first@example.com', 'secret', 'First', 'developer')
    const second = await localAuthRepository.signUpWithEmail('second@example.com', 'secret', 'Second', 'qa')

    expect(first.role).toBe('admin')
    expect(second.role).toBe('participant')
  })

  it('normalizes legacy users without a role to participant', async () => {
    writeJson(STORAGE_KEYS.users, [{
      id: 'legacy',
      email: 'legacy@example.com',
      name: 'Legacy',
      archetype: 'ux',
      createdAt: '2026-01-01T00:00:00.000Z',
    }])
    writeJson(STORAGE_KEYS.session, 'legacy')

    const session = await localAuthRepository.getSession()

    expect(session?.role).toBe('participant')
  })
})

describe('local user repository', () => {
  const users: User[] = [
    {
      id: 'alice',
      email: 'alice@example.com',
      name: 'Alice',
      archetype: 'developer',
      role: 'participant',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'bob',
      email: 'bob@example.com',
      name: 'Bob',
      archetype: 'ux',
      role: 'admin',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ]

  it('updates the role of a user and the current session', async () => {
    writeJson(STORAGE_KEYS.users, users)
    writeJson(STORAGE_KEYS.session, users[0])

    const updated = await localUserRepository.updateRole('alice', 'admin')

    expect(updated.role).toBe('admin')
    expect((await localUserRepository.list()).find(user => user.id === 'alice')?.role).toBe('admin')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.session) as string).role).toBe('admin')
  })

  it('throws NOT_FOUND for unknown users', async () => {
    writeJson(STORAGE_KEYS.users, users)

    await expect(localUserRepository.updateRole('missing', 'admin')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })
})

describe('local metrics repository', () => {
  it('initializes metrics with rarity bonus and appends rewards', async () => {
    const initial = await localMetricsRepository.initialize('user-1', 'Épico')
    expect(initial).toMatchObject({ expertise: 1, auraTech: 5 })

    const updated = await localMetricsRepository.addReward('user-1', 'contact_add', 'ux', 'developer')
    expect(updated).toMatchObject({ expertise: 1, auraTech: 10 })
    expect(updated.history).toHaveLength(2)
  })

  it('returns empty metrics for unknown users', async () => {
    expect(await localMetricsRepository.get('missing')).toEqual({
      expertise: 0,
      auraTech: 0,
      history: [],
    })
  })
})

describe('local contacts repository', () => {
  it('adds contacts once and preserves the battle origin', async () => {
    const contact = {
      userId: 'target-1',
      name: 'Target',
      email: 'target@example.com',
      archetype: 'ux' as const,
      origin: 'battle_win' as const,
    }

    expect(await localContactsRepository.add('user-1', contact)).toBe(true)
    expect(await localContactsRepository.add('user-1', contact)).toBe(false)
    expect(await localContactsRepository.isContact('user-1', 'target-1')).toBe(true)
    expect(await localContactsRepository.list('user-1')).toEqual([
      expect.objectContaining({ userId: 'target-1', origin: 'battle_win' }),
    ])
  })
})

describe('local battles repository', () => {
  it('saves battles and tracks fought opponents', async () => {
    const battle: BattleResult = {
      id: 'battle-1',
      opponentId: 'target-1',
      opponentName: 'Target',
      opponentArchetype: 'qa',
      rounds: [],
      outcome: 'win',
      timestamp: '2026-01-01T00:00:00.000Z',
    }

    await localBattlesRepository.save('user-1', battle)

    expect(await localBattlesRepository.list('user-1')).toEqual([battle])
    expect(await localBattlesRepository.hasFought('user-1', 'target-1')).toBe(true)
    expect(await localBattlesRepository.getFoughtOpponents('user-1')).toEqual(['target-1'])
  })
})

describe('local achievements repository', () => {
  it('unlocks achievements once', async () => {
    const context: AchievementContext = {
      userId: 'user-1',
      metrics: { expertise: 0, auraTech: 0, history: [] },
      contactCount: 1,
      battleCount: 0,
      battleWins: 0,
      uniqueArchetypesContacted: 1,
    }

    const first = await localAchievementsRepository.checkAndUnlock('user-1', context)
    const second = await localAchievementsRepository.checkAndUnlock('user-1', context)

    expect(first.map(achievement => achievement.id)).toEqual(['first-contact'])
    expect(second).toEqual([])
    expect(await localAchievementsRepository.listUnlocked('user-1')).toHaveLength(1)
  })
})

describe('local check-ins repository', () => {
  it('adds check-ins once', async () => {
    const checkIn = { talkId: 'talk-01', title: 'Talk', speaker: 'Speaker' }

    expect(await localCheckInsRepository.add('user-1', checkIn)).toBe(true)
    expect(await localCheckInsRepository.add('user-1', checkIn)).toBe(false)
    expect(await localCheckInsRepository.hasCheckedIn('user-1', 'talk-01')).toBe(true)
    expect(await localCheckInsRepository.list('user-1')).toHaveLength(1)
  })
})

describe('local talks repository', () => {
  it('returns the seed talks', async () => {
    const talks = await localTalksRepository.list()

    expect(talks).toHaveLength(10)
    expect(talks[0]).toMatchObject({
      talkId: 'reconstruyendo-equipo-plataforma-ted-lasso',
      speaker: 'Anastasia Kondratieva',
    })
  })
})

describe('local rankings repository', () => {
  const users: User[] = [
    {
      id: 'alice',
      email: 'alice@example.com',
      name: 'Alice',
      archetype: 'developer',
      role: 'participant',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'bob',
      email: 'bob@example.com',
      name: 'Bob',
      archetype: 'ux',
      role: 'participant',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'carla',
      email: 'carla@example.com',
      name: 'Carla',
      archetype: 'qa',
      role: 'participant',
      createdAt: '2026-01-03T00:00:00.000Z',
    },
  ]

  function battle(id: string, opponentId: string, outcome: BattleResult['outcome']): BattleResult {
    return {
      id,
      opponentId,
      opponentName: opponentId,
      opponentArchetype: 'multiclass',
      rounds: [],
      outcome,
      timestamp: '2026-01-01T00:00:00.000Z',
    }
  }

  async function seedRankings() {
    writeJson(STORAGE_KEYS.users, users)

    await localMetricsRepository.initialize('alice', 'Inusual')
    await localMetricsRepository.addReward('alice', 'battle_win')
    await localMetricsRepository.addReward('alice', 'battle_win')

    await localMetricsRepository.initialize('bob', 'Inusual')
    await localMetricsRepository.addReward('bob', 'talk_checkin')
    await localMetricsRepository.addReward('bob', 'talk_checkin')
    await localMetricsRepository.addReward('bob', 'talk_checkin')

    await localMetricsRepository.initialize('carla', 'Inusual')
    await localMetricsRepository.addReward('carla', 'battle_win')
    await localMetricsRepository.addReward('carla', 'battle_loss')
    await localMetricsRepository.addReward('carla', 'battle_loss')

    await localContactsRepository.add('alice', {
      userId: 'bob',
      name: 'Bob',
      email: 'bob@example.com',
      archetype: 'ux',
    })
    await localContactsRepository.add('bob', {
      userId: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      archetype: 'developer',
    })
    await localContactsRepository.add('bob', {
      userId: 'carla',
      name: 'Carla',
      email: 'carla@example.com',
      archetype: 'qa',
    })

    await localBattlesRepository.save('alice', battle('battle-1', 'bob', 'win'))
    await localBattlesRepository.save('alice', battle('battle-2', 'carla', 'win'))
    await localBattlesRepository.save('carla', battle('battle-3', 'bob', 'win'))
    await localBattlesRepository.save('carla', battle('battle-4', 'alice', 'loss'))
    await localBattlesRepository.save('carla', battle('battle-5', 'bob', 'loss'))
  }

  it('ranks users in the four categories', async () => {
    await seedRankings()

    const expertise = await localRankingsRepository.getByCategory('expertise')
    expect(expertise.entries.map(entry => [entry.rank, entry.userId, entry.score])).toEqual([
      [1, 'alice', 11],
      [2, 'carla', 10],
      [3, 'bob', 1],
    ])

    const aura = await localRankingsRepository.getByCategory('aura')
    expect(aura.entries.map(entry => [entry.rank, entry.userId, entry.score])).toEqual([
      [1, 'bob', 16],
      [2, 'alice', 7],
      [3, 'carla', 6],
    ])

    const contacts = await localRankingsRepository.getByCategory('contacts')
    expect(contacts.entries.map(entry => [entry.rank, entry.userId, entry.score])).toEqual([
      [1, 'bob', 2],
      [2, 'alice', 1],
      [3, 'carla', 0],
    ])

    const wins = await localRankingsRepository.getByCategory('wins')
    expect(wins.entries.map(entry => [entry.rank, entry.userId, entry.score])).toEqual([
      [1, 'alice', 2],
      [2, 'carla', 1],
      [3, 'bob', 0],
    ])
  })

  it('keeps the current user position outside the returned top', async () => {
    await seedRankings()

    const ranking = await localRankingsRepository.getByCategory('expertise', {
      limit: 1,
      currentUserId: 'bob',
    })

    expect(ranking.entries).toHaveLength(1)
    expect(ranking.currentUser).toEqual({
      rank: 3,
      userId: 'bob',
      name: 'Bob',
      archetype: 'ux',
      score: 1,
    })
  })
})

describe('local dashboard repository', () => {
  const dashboardUsers: User[] = [
    {
      id: 'alice',
      email: 'alice@example.com',
      name: 'Alice',
      archetype: 'developer',
      role: 'participant',
      createdAt: '2026-01-01T09:00:00.000Z',
    },
    {
      id: 'bob',
      email: 'bob@example.com',
      name: 'Bob',
      archetype: 'ux',
      role: 'participant',
      createdAt: '2026-01-01T09:10:00.000Z',
    },
    {
      id: 'carla',
      email: 'carla@example.com',
      name: 'Carla',
      archetype: 'qa',
      role: 'participant',
      createdAt: '2026-01-01T09:20:00.000Z',
    },
  ]

  function writeMetrics(
    userId: string,
    history: Array<{
      action: Parameters<typeof localMetricsRepository.addReward>[1]
      expertise: number
      auraTech: number
      timestamp: string
    }>,
  ) {
    writeJson(userKey(STORAGE_KEYS.metrics, userId), {
      expertise: history.reduce((total, entry) => total + entry.expertise, 0),
      auraTech: history.reduce((total, entry) => total + entry.auraTech, 0),
      history,
    })
  }

  async function seedDashboard() {
    writeJson(STORAGE_KEYS.users, dashboardUsers)

    writeMetrics('alice', [
      { action: 'register', expertise: 1, auraTech: 1, timestamp: '2026-01-01T10:00:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T10:05:00.000Z' },
      { action: 'talk_checkin', expertise: 0, auraTech: 5, timestamp: '2026-01-01T10:08:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T10:10:00.000Z' },
      { action: 'contact_diverse', expertise: 0, auraTech: 3, timestamp: '2026-01-01T10:12:00.000Z' },
    ])

    writeMetrics('bob', [
      { action: 'register', expertise: 1, auraTech: 1, timestamp: '2026-01-01T11:00:00.000Z' },
      { action: 'talk_checkin', expertise: 0, auraTech: 5, timestamp: '2026-01-01T11:05:00.000Z' },
      { action: 'talk_checkin', expertise: 0, auraTech: 5, timestamp: '2026-01-01T11:10:00.000Z' },
      { action: 'talk_checkin', expertise: 0, auraTech: 5, timestamp: '2026-01-01T11:20:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T11:30:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T11:40:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T11:50:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T12:00:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T12:10:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T12:20:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T12:30:00.000Z' },
      { action: 'battle_win', expertise: 5, auraTech: 3, timestamp: '2026-01-01T12:40:00.000Z' },
    ])

    writeMetrics('carla', [
      { action: 'register', expertise: 1, auraTech: 1, timestamp: '2026-01-01T09:30:00.000Z' },
      { action: 'contact_add', expertise: 0, auraTech: 2, timestamp: '2026-01-01T09:35:00.000Z' },
    ])

    await localContactsRepository.add('alice', {
      userId: 'bob',
      name: 'Bob',
      email: 'bob@example.com',
      archetype: 'ux',
    })
    await localContactsRepository.add('bob', {
      userId: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      archetype: 'developer',
    })

    await localBattlesRepository.save('alice', {
      id: 'battle-1',
      opponentId: 'bob',
      opponentName: 'Bob',
      opponentArchetype: 'ux',
      rounds: [],
      outcome: 'win',
      timestamp: '2026-01-01T10:20:00.000Z',
    })
    await localBattlesRepository.save('bob', {
      id: 'battle-2',
      opponentId: 'carla',
      opponentName: 'Carla',
      opponentArchetype: 'qa',
      rounds: [],
      outcome: 'loss',
      timestamp: '2026-01-01T11:55:00.000Z',
    })

    writeJson(userKey(STORAGE_KEYS.achievements, 'alice'), [
      { id: 'first-contact', unlockedAt: '2026-01-01T10:21:00.000Z' },
    ])
    writeJson(userKey(STORAGE_KEYS.achievements, 'bob'), [
      { id: 'first-contact', unlockedAt: '2026-01-01T11:56:00.000Z' },
    ])
  }

  it('aggregates global stats, rankings and recent evolutions', async () => {
    await seedDashboard()

    const dashboard = await localDashboardRepository.getOverview()

    expect(dashboard.stats).toEqual({
      totalUsers: 3,
      totalBattles: 2,
      totalContacts: 2,
      totalAchievements: 2,
    })
    expect(dashboard.rankings.aura).toHaveLength(3)
    expect(dashboard.rankings.aura[0].userId).toBe('bob')
    expect(dashboard.recentEvolutions.map(evolution => evolution.userId)).toEqual(['bob', 'alice'])
    expect(dashboard.recentEvolutions[0]).toMatchObject({
      name: 'Bob',
      stage: 2,
      totalPoints: 65,
      evolvedAt: '2026-01-01T12:20:00.000Z',
    })
    expect(dashboard.recentEvolutions[1]).toMatchObject({
      name: 'Alice',
      stage: 1,
      evolvedAt: '2026-01-01T10:10:00.000Z',
    })
  })

  it('respects the ranking and evolution limits', async () => {
    await seedDashboard()

    const dashboard = await localDashboardRepository.getOverview({
      rankingsLimit: 1,
      evolutionsLimit: 1,
    })

    expect(dashboard.rankings.aura).toHaveLength(1)
    expect(dashboard.rankings.expertise).toHaveLength(1)
    expect(dashboard.rankings.contacts).toHaveLength(1)
    expect(dashboard.rankings.wins).toHaveLength(1)
    expect(dashboard.recentEvolutions).toHaveLength(1)
    expect(dashboard.recentEvolutions[0].userId).toBe('bob')
  })

  it('aggregates admin stats with average metrics', async () => {
    await seedDashboard()

    const dashboard = await localDashboardRepository.getAdminOverview()

    expect(dashboard.stats).toMatchObject({
      totalUsers: 3,
      totalBattles: 2,
      totalContacts: 2,
      totalAchievements: 2,
    })
    expect(dashboard.stats.averageExpertise).toBeCloseTo(53 / 3)
    expect(dashboard.stats.averageAuraTech).toBeCloseTo(58 / 3)
  })
})

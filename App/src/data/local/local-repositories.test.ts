import { beforeEach, describe, expect, it } from 'vitest'
import { localAchievementsRepository } from './achievements-repository'
import { localAuthRepository } from './auth-repository'
import { localBattlesRepository } from './battles-repository'
import { localCheckInsRepository } from './checkins-repository'
import { localContactsRepository } from './contacts-repository'
import { localMetricsRepository } from './metrics-repository'
import { localTalksRepository } from './talks-repository'
import type { AchievementContext } from '../types'
import type { BattleResult } from '../../lib/battle'

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

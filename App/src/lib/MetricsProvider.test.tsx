import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MISSION_DEFINITIONS } from './missions'
import { MetricsProvider, useMetrics } from './MetricsProvider'

const mocks = vi.hoisted(() => {
  const metricsGet = vi.fn()
  const metricsAddReward = vi.fn()
  const contactsList = vi.fn()
  const battlesList = vi.fn()
  const achievementsCheck = vi.fn()
  const missionsCheck = vi.fn()

  return {
    isEnabled: vi.fn(),
    metricsGet,
    metricsAddReward,
    contactsList,
    battlesList,
    achievementsCheck,
    missionsCheck,
    user: {
      id: 'user-1',
      name: 'Test',
      email: 'test@example.com',
      archetype: 'developer',
      role: 'participant',
    },
    repositories: {
      metrics: { get: metricsGet, addReward: metricsAddReward },
      contacts: { list: contactsList },
      battles: { list: battlesList },
      achievements: { checkAndUnlock: achievementsCheck },
      missions: { checkAndComplete: missionsCheck },
    },
  }
})

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

vi.mock('./FeatureFlagsProvider', () => ({
  useFeatureFlags: () => ({ isEnabled: mocks.isEnabled }),
}))

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

vi.mock('../components/AchievementToast', () => ({
  AchievementToast: () => null,
}))

vi.mock('../components/MissionToast', () => ({
  MissionToast: () => null,
}))

function Probe() {
  const { metrics, addMetricsReward } = useMetrics()

  return (
    <div>
      <span>{`${metrics.expertise}/${metrics.auraTech}`}</span>
      <button onClick={() => void addMetricsReward('contact_add')}>reward</button>
    </div>
  )
}

function emptyMetrics() {
  return { expertise: 0, auraTech: 0, history: [] }
}

describe('MetricsProvider missions integration', () => {
  beforeEach(() => {
    mocks.isEnabled.mockReset()
    mocks.metricsGet.mockReset()
    mocks.metricsAddReward.mockReset()
    mocks.contactsList.mockReset()
    mocks.battlesList.mockReset()
    mocks.achievementsCheck.mockReset()
    mocks.missionsCheck.mockReset()
    mocks.metricsGet.mockResolvedValue(emptyMetrics())
    mocks.contactsList.mockResolvedValue([])
    mocks.battlesList.mockResolvedValue([])
    mocks.achievementsCheck.mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('applies the mission rewards returned by the automatic check', async () => {
    mocks.isEnabled.mockReturnValue(true)
    mocks.metricsAddReward.mockResolvedValue({ expertise: 0, auraTech: 3, history: [] })
    mocks.missionsCheck.mockResolvedValue({
      completed: [MISSION_DEFINITIONS[0]],
      metrics: { expertise: 0, auraTech: 8, history: [] },
      grantedObjectIds: [],
    })

    render(
      <MetricsProvider>
        <Probe />
      </MetricsProvider>,
    )

    expect(await screen.findByText('0/0')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'reward' }))

    expect(await screen.findByText('0/8')).toBeTruthy()
    expect(mocks.missionsCheck).toHaveBeenCalledWith('user-1')
    expect(mocks.metricsAddReward).toHaveBeenCalledWith(
      'user-1',
      'contact_add',
      undefined,
      'developer',
    )
  })

  it('skips the mission check when the missions flag is disabled', async () => {
    mocks.isEnabled.mockReturnValue(false)
    mocks.metricsAddReward.mockResolvedValue({ expertise: 0, auraTech: 2, history: [] })

    render(
      <MetricsProvider>
        <Probe />
      </MetricsProvider>,
    )

    expect(await screen.findByText('0/0')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'reward' }))

    expect(await screen.findByText('0/2')).toBeTruthy()
    expect(mocks.missionsCheck).not.toHaveBeenCalled()
  })
})

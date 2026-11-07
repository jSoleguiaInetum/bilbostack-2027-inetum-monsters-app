import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { PublicDashboardPage } from './PublicDashboardPage'
import type { PublicDashboard } from '../lib/dashboard'

const mocks = vi.hoisted(() => {
  const getOverview = vi.fn()
  return {
    getOverview,
    repositories: { dashboard: { getOverview } },
  }
})

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

function dashboard(overrides: Partial<PublicDashboard> = {}): PublicDashboard {
  return {
    stats: {
      totalUsers: 42,
      totalBattles: 123,
      totalContacts: 87,
      totalAchievements: 65,
    },
    rankings: {
      aura: [{ rank: 1, userId: 'bob', name: 'Bob', archetype: 'ux', score: 16 }],
      expertise: [{ rank: 1, userId: 'alice', name: 'Alice', archetype: 'developer', score: 11 }],
      contacts: [],
      wins: [],
    },
    recentEvolutions: [{
      userId: 'bob',
      name: 'Bob',
      archetype: 'ux',
      stage: 2,
      totalPoints: 65,
      evolvedAt: '2026-01-01T12:20:00.000Z',
    }],
    ...overrides,
  }
}

describe('PublicDashboardPage', () => {
  beforeEach(() => {
    mocks.getOverview.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders the global stats, the four rankings and the evolution feed', async () => {
    mocks.getOverview.mockResolvedValueOnce(dashboard())

    render(<PublicDashboardPage />)

    expect(await screen.findByText('42')).toBeTruthy()
    expect(screen.getByText('123')).toBeTruthy()
    expect(screen.getByText('87')).toBeTruthy()
    expect(screen.getByText('65')).toBeTruthy()

    expect(screen.getByRole('heading', { name: /Aura Tech/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Expertise/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Contactos/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Victorias/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Evoluciones recientes/i })).toBeTruthy()

    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getAllByText('Bob')).toHaveLength(2)
    expect(screen.getAllByText('Sin datos todavía')).toHaveLength(2)

    expect(mocks.getOverview).toHaveBeenCalledWith({
      rankingsLimit: 5,
      evolutionsLimit: 8,
    })
  })

  it('refreshes the dashboard every 30 seconds', async () => {
    vi.useFakeTimers()
    mocks.getOverview.mockResolvedValue(dashboard())

    render(<PublicDashboardPage />)

    await act(async () => {
      await Promise.resolve()
    })
    expect(mocks.getOverview).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(30_000)
      await Promise.resolve()
    })

    expect(mocks.getOverview).toHaveBeenCalledTimes(2)
  })

  it('shows an error and allows retrying', async () => {
    mocks.getOverview
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(dashboard())

    render(<PublicDashboardPage />)

    expect(await screen.findByText('No se pudo cargar el dashboard')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))

    expect(await screen.findByText('42')).toBeTruthy()
  })
})

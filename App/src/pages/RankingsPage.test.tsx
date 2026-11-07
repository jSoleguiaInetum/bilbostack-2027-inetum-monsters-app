import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RankingsPage } from './RankingsPage'
import type { Ranking } from '../lib/rankings'

const mocks = vi.hoisted(() => {
  const getByCategory = vi.fn()
  return {
    getByCategory,
    repositories: { rankings: { getByCategory } },
    user: {
      id: 'alice',
      email: 'alice@example.com',
      name: 'Alice',
      archetype: 'developer',
      role: 'participant',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  }
})

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

function ranking(overrides: Partial<Ranking> = {}): Ranking {
  return {
    category: 'aura',
    entries: [
      { rank: 1, userId: 'bob', name: 'Bob', archetype: 'ux', score: 16 },
      { rank: 2, userId: 'carla', name: 'Carla', archetype: 'qa', score: 6 },
    ],
    currentUser: { rank: 3, userId: 'alice', name: 'Alice', archetype: 'developer', score: 5 },
    ...overrides,
  }
}

describe('RankingsPage', () => {
  beforeEach(() => {
    mocks.getByCategory.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows the four rankings and the current user position', async () => {
    mocks.getByCategory.mockResolvedValueOnce(ranking())

    render(<RankingsPage />)

    expect(await screen.findByText('Bob')).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Aura Tech/i }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: /Expertise/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Contactos/i })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Victorias/i })).toBeTruthy()
    expect(screen.getByText('TU POSICIÓN')).toBeTruthy()
    expect(screen.getByText('Carla')).toBeTruthy()

    expect(mocks.getByCategory).toHaveBeenCalledWith('aura', {
      limit: 20,
      currentUserId: 'alice',
    })
  })

  it('loads the selected ranking category', async () => {
    mocks.getByCategory
      .mockResolvedValueOnce(ranking())
      .mockResolvedValueOnce(ranking({
        category: 'expertise',
        entries: [{ rank: 1, userId: 'alice', name: 'Alice', archetype: 'developer', score: 11 }],
        currentUser: { rank: 1, userId: 'alice', name: 'Alice', archetype: 'developer', score: 11 },
      }))

    render(<RankingsPage />)
    await screen.findByText('Bob')

    fireEvent.click(screen.getByRole('tab', { name: /Expertise/i }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Expertise/i }).getAttribute('aria-selected')).toBe('true')
    })
    expect(await screen.findByText('TÚ')).toBeTruthy()
    expect(mocks.getByCategory).toHaveBeenLastCalledWith('expertise', {
      limit: 20,
      currentUserId: 'alice',
    })
  })

  it('refreshes the ranking every 30 seconds', async () => {
    vi.useFakeTimers()
    mocks.getByCategory.mockResolvedValue(ranking())

    render(<RankingsPage />)

    await act(async () => {
      await Promise.resolve()
    })
    expect(mocks.getByCategory).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(30_000)
      await Promise.resolve()
    })

    expect(mocks.getByCategory).toHaveBeenCalledTimes(2)
  })

  it('shows an error and allows retrying', async () => {
    mocks.getByCategory
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(ranking())

    render(<RankingsPage />)

    expect(await screen.findByText('No se pudieron cargar los rankings')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))

    expect(await screen.findByText('Bob')).toBeTruthy()
  })
})

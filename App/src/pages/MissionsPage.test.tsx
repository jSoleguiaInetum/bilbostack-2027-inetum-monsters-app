import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { MissionProgress } from '../lib/missions'
import { MissionsPage } from './MissionsPage'

const mocks = vi.hoisted(() => {
  const listMissions = vi.fn()
  const listDefinitions = vi.fn()
  const refreshMetrics = vi.fn()

  return {
    listMissions,
    listDefinitions,
    refreshMetrics,
    metrics: { expertise: 0, auraTech: 0, history: [] },
    user: {
      id: 'user-1',
      name: 'Test',
      email: 'test@example.com',
      archetype: 'developer',
      role: 'participant',
    },
    repositories: {
      missions: { list: listMissions },
      inventory: { listDefinitions },
    },
  }
})

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

vi.mock('../lib/MetricsProvider', () => ({
  useMetrics: () => ({
    metrics: mocks.metrics,
    refreshMetrics: mocks.refreshMetrics,
  }),
}))

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

const progress: MissionProgress[] = [
  {
    mission: {
      id: 'mission-first-contact',
      name: 'Primer movimiento',
      description: 'Añade tu primer contacto',
      type: 'base',
      objective: { type: 'contacts', target: 1 },
      reward: { expertise: 0, auraTech: 3 },
      isActive: true,
    },
    status: 'active',
    current: 0,
    target: 1,
  },
  {
    mission: {
      id: 'mission-network-3',
      name: 'Red de tres',
      description: 'Consigue 3 contactos',
      type: 'base',
      objective: { type: 'contacts', target: 3 },
      reward: { expertise: 3, auraTech: 3, objectId: 'object-09' },
      isActive: true,
    },
    status: 'completed',
    current: 3,
    target: 3,
    completedAt: '2026-01-01T10:00:00.000Z',
  },
]

describe('MissionsPage', () => {
  beforeEach(() => {
    mocks.listMissions.mockReset()
    mocks.listDefinitions.mockReset()
    mocks.refreshMetrics.mockReset()
    mocks.listMissions.mockResolvedValue(progress)
    mocks.listDefinitions.mockResolvedValue([
      { id: 'object-09', name: 'Portátil de Batalla' },
    ])
    mocks.refreshMetrics.mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('shows active and completed missions with progress and rewards', async () => {
    render(<MissionsPage />)

    expect(await screen.findByText('Primer movimiento')).toBeTruthy()
    expect(screen.getByText('Red de tres')).toBeTruthy()
    expect(screen.getByText('0 / 1')).toBeTruthy()
    expect(screen.getByText('3 / 3')).toBeTruthy()
    expect(screen.getByText('Completada')).toBeTruthy()
    expect(screen.getByText('📦 Portátil de Batalla')).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: 'Progreso de Primer movimiento' })
      .getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByRole('progressbar', { name: 'Progreso de Red de tres' })
      .getAttribute('aria-valuenow')).toBe('3')
    expect(mocks.refreshMetrics).toHaveBeenCalled()
  })

  it('shows an error state when the missions cannot be loaded', async () => {
    mocks.listMissions.mockRejectedValue(new Error('offline'))

    render(<MissionsPage />)

    expect(await screen.findByText('No se pudieron cargar las misiones.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy()
  })
})

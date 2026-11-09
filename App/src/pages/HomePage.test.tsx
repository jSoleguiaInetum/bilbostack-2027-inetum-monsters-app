import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HomePage } from './HomePage'
import type { Achievement } from '../lib/achievements'

const mocks = vi.hoisted(() => {
  const listDefinitions = vi.fn()
  const listUnlocked = vi.fn()

  return {
    listDefinitions,
    listUnlocked,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      archetype: 'developer',
      role: 'participant',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    metrics: { expertise: 25, auraTech: 10, history: [] },
    flags: { isEnabled: (_key: string): boolean => false },
    repositories: {
      achievements: { listDefinitions, listUnlocked },
    },
  }
})

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

vi.mock('../lib/MetricsProvider', () => ({
  useMetrics: () => ({ metrics: mocks.metrics }),
}))

vi.mock('../lib/FeatureFlagsProvider', () => ({
  useFeatureFlags: () => mocks.flags,
}))

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

function achievement(id: string, name: string): Achievement {
  return {
    id,
    name,
    description: `Descripción de ${name}`,
    icon: '★',
    hidden: false,
    condition: () => true,
  }
}

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    mocks.listDefinitions.mockReset()
    mocks.listUnlocked.mockReset()
    mocks.flags = { isEnabled: () => false }
    mocks.listDefinitions.mockResolvedValue([])
    mocks.listUnlocked.mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('shows the player summary and the most recent achievements first', async () => {
    mocks.listDefinitions.mockResolvedValue([
      achievement('alpha', 'Logro Alfa'),
      achievement('beta', 'Logro Beta'),
      achievement('gamma', 'Logro Gamma'),
    ])
    mocks.listUnlocked.mockResolvedValue([
      { id: 'alpha', unlockedAt: '2026-01-01T10:00:00.000Z' },
      { id: 'beta', unlockedAt: '2026-01-03T10:00:00.000Z' },
      { id: 'gamma', unlockedAt: '2026-01-02T10:00:00.000Z' },
    ])

    renderHome()

    expect(screen.getByRole('heading', { name: /Hola, Test/i })).toBeTruthy()
    expect(screen.getByText('Expertise')).toBeTruthy()
    expect(screen.getByText('Aura Tech')).toBeTruthy()

    const recent = await screen.findAllByTestId('recent-achievement')
    expect(recent.map(node => node.textContent)).toEqual([
      expect.stringContaining('Logro Beta'),
      expect.stringContaining('Logro Gamma'),
      expect.stringContaining('Logro Alfa'),
    ])
  })

  it('links to every main section from the home grid', () => {
    renderHome()

    expect(screen.getByRole('link', { name: 'Mi Criatura' }).getAttribute('href')).toBe('/my-monster')
    expect(screen.getByRole('link', { name: 'Mi QR' }).getAttribute('href')).toBe('/qr')
    expect(screen.getByRole('link', { name: 'Escanear QR' }).getAttribute('href')).toBe('/scan')
    expect(screen.getByRole('link', { name: 'Contactos' }).getAttribute('href')).toBe('/contacts')
    expect(screen.getByRole('link', { name: 'Logros' }).getAttribute('href')).toBe('/achievements')
    expect(screen.getByRole('link', { name: 'Rankings' }).getAttribute('href')).toBe('/rankings')
    expect(screen.queryByRole('link', { name: 'Inventario' })).toBeNull()
  })

  it('shows inventory and missions only when their feature flags are enabled', () => {
    mocks.flags = { isEnabled: () => true }

    renderHome()

    expect(screen.getByRole('link', { name: 'Inventario' }).getAttribute('href')).toBe('/inventory')
    expect(screen.getByRole('link', { name: 'Misiones' }).getAttribute('href')).toBe('/missions')
  })

  it('shows an empty state when there are no recent achievements', async () => {
    renderHome()

    expect(await screen.findByText(/Todavía no desbloqueaste logros/i)).toBeTruthy()
  })
})

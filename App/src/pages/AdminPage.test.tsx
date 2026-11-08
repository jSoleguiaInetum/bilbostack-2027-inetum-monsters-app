import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AdminPage } from './AdminPage'
import type { User } from '../auth/types'
import type { AdminDashboard } from '../lib/dashboard'

const mocks = vi.hoisted(() => {
  const list = vi.fn()
  const updateRole = vi.fn()
  const getAdminOverview = vi.fn()
  const setFlag = vi.fn()
  return {
    auth: { user: { id: 'admin-1', name: 'Admin', role: 'admin' }, loading: false },
    list,
    updateRole,
    getAdminOverview,
    setFlag,
    featureFlags: {
      flags: { inventory: false, missions: false },
      isEnabled: () => false,
      loading: false,
      error: false,
      refresh: () => undefined,
      setFlag,
    },
    repositories: {
      users: { list, updateRole },
      dashboard: { getAdminOverview },
    },
  }
})

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => mocks.auth,
}))

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

vi.mock('../lib/FeatureFlagsProvider', () => ({
  useFeatureFlags: () => mocks.featureFlags,
}))

const USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin',
    archetype: 'developer',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    name: 'Bob',
    archetype: 'ux',
    role: 'participant',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
]

function adminDashboard(): AdminDashboard {
  return {
    stats: {
      totalUsers: 2,
      totalBattles: 7,
      totalContacts: 5,
      totalAchievements: 3,
      averageExpertise: 12.5,
      averageAuraTech: 8,
    },
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  )
}

describe('AdminPage', () => {
  beforeEach(() => {
    mocks.list.mockReset().mockResolvedValue(USERS)
    mocks.updateRole.mockReset()
    mocks.getAdminOverview.mockReset().mockResolvedValue(adminDashboard())
    mocks.setFlag.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the stats and the registered users', async () => {
    renderPage()

    expect(await screen.findByText('Bob')).toBeTruthy()
    expect(screen.getByText('admin@example.com · Developer')).toBeTruthy()
    expect(screen.getByText('bob@example.com · UX / Design')).toBeTruthy()
    expect(screen.getByText('12.5')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
    expect(screen.getByText('7')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('filters users by search term', async () => {
    renderPage()

    expect(await screen.findByText('bob@example.com · UX / Design')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('Nombre o email'), {
      target: { value: 'bob' },
    })

    expect(screen.queryByText('admin@example.com · Developer')).toBeNull()
    expect(screen.getByText('bob@example.com · UX / Design')).toBeTruthy()
  })

  it('promotes a participant to admin and refreshes the stats', async () => {
    mocks.updateRole.mockResolvedValueOnce({ ...USERS[1], role: 'admin' })

    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /Hacer admin/i }))

    await waitFor(() => {
      expect(mocks.updateRole).toHaveBeenCalledWith('user-2', 'admin')
    })
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Quitar admin/i })).toHaveLength(2)
    })
    expect(mocks.getAdminOverview).toHaveBeenCalledTimes(2)
  })

  it('does not allow changing the current user role', async () => {
    renderPage()

    const selfButton = await screen.findByRole('button', { name: /Quitar admin/i })

    expect((selfButton as HTMLButtonElement).disabled).toBe(true)
  })

  it('lists the feature flags and toggles the inventory', async () => {
    renderPage()

    const toggle = await screen.findByRole('switch', { name: /Inventario/i })

    expect(toggle.getAttribute('aria-checked')).toBe('false')

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(mocks.setFlag).toHaveBeenCalledWith('inventory', true)
    })
  })
})

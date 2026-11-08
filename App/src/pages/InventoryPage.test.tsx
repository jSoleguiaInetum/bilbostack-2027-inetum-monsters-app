import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { InventoryPage } from './InventoryPage'
import type { GameObject, UserObject } from '../lib/objects'

const mocks = vi.hoisted(() => {
  const listDefinitions = vi.fn()
  const listOwned = vi.fn()
  return {
    listDefinitions,
    listOwned,
    repositories: { inventory: { listDefinitions, listOwned } },
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

function definition(overrides: Partial<GameObject> = {}): GameObject {
  return {
    id: 'object-01',
    name: 'Teclado Mecánico',
    description: 'Teclado compacto de precisión',
    rarity: 'Inusual',
    benefit: 'Estilo retro para tu criatura',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: '/monster-assets/objects/object-01.svg',
    origin: 'BilboStack',
    isActive: true,
    ...overrides,
  }
}

function owned(overrides: Partial<UserObject> = {}): UserObject {
  return {
    objectId: 'object-01',
    obtainedAt: '2026-01-01T00:00:00.000Z',
    source: 'achievement',
    ...overrides,
  }
}

describe('InventoryPage', () => {
  beforeEach(() => {
    mocks.listDefinitions.mockReset()
    mocks.listOwned.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows a loading state while the inventory loads', () => {
    mocks.listDefinitions.mockReturnValue(new Promise(() => {}))
    mocks.listOwned.mockReturnValue(new Promise(() => {}))

    render(<InventoryPage />)

    expect(screen.getByText('Cargando inventario...')).toBeTruthy()
  })

  it('shows the empty state when the user has no objects', async () => {
    mocks.listDefinitions.mockResolvedValue([definition()])
    mocks.listOwned.mockResolvedValue([])

    render(<InventoryPage />)

    expect(await screen.findByText('Todavía no obtuviste objetos.')).toBeTruthy()
  })

  it('shows the owned objects with name, rarity, benefit and source', async () => {
    mocks.listDefinitions.mockResolvedValue([
      definition(),
      definition({ id: 'object-02', name: 'Paleta de Diseño', rarity: 'Singular' }),
    ])
    mocks.listOwned.mockResolvedValue([owned()])

    render(<InventoryPage />)

    expect(await screen.findByText('Teclado Mecánico')).toBeTruthy()
    expect(screen.getByText('Inusual')).toBeTruthy()
    expect(screen.getByText('Estilo retro para tu criatura')).toBeTruthy()
    expect(screen.getByText('Logro')).toBeTruthy()
    expect(screen.queryByText('Paleta de Diseño')).toBeNull()
  })

  it('shows an error and retries the load', async () => {
    mocks.listDefinitions
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce([definition()])
    mocks.listOwned
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([owned()])

    render(<InventoryPage />)

    expect(await screen.findByText('No se pudo cargar el inventario.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }))
    expect(await screen.findByText('Teclado Mecánico')).toBeTruthy()
  })
})

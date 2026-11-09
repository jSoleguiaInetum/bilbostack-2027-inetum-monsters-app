import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AdminAchievements } from './AdminAchievements'
import type { Achievement } from '../../lib/achievements'

const mocks = vi.hoisted(() => {
  const listAllDefinitions = vi.fn()
  const createDefinition = vi.fn()
  const updateDefinition = vi.fn()
  const deleteDefinition = vi.fn()
  const listObjects = vi.fn()
  return {
    listAllDefinitions,
    createDefinition,
    updateDefinition,
    deleteDefinition,
    listObjects,
    repositories: {
      achievements: {
        listAllDefinitions,
        createDefinition,
        updateDefinition,
        deleteDefinition,
      },
      inventory: { listAllDefinitions: listObjects },
    },
  }
})

vi.mock('../../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

const DEFINITION: Achievement = {
  id: 'first-contact',
  name: 'Primer contacto',
  description: 'Añade a tu primer contacto',
  icon: '🤝',
  hidden: false,
  isActive: true,
  conditionType: 'contacts',
  conditionTarget: 1,
}

describe('AdminAchievements', () => {
  beforeEach(() => {
    mocks.listAllDefinitions.mockReset().mockResolvedValue([DEFINITION])
    mocks.listObjects.mockReset().mockResolvedValue([{
      id: 'object-01',
      name: 'Teclado',
      description: '',
      rarity: 'Inusual',
      benefit: '',
      benefitType: 'Cosmetic',
      benefitValue: 0,
      iconUrl: '/object.svg',
      origin: 'BilboStack',
      isActive: true,
    }])
    mocks.createDefinition.mockReset().mockResolvedValue({ ...DEFINITION, id: 'custom' })
    mocks.updateDefinition.mockReset().mockResolvedValue(DEFINITION)
    mocks.deleteDefinition.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('lists definitions and creates a new achievement', async () => {
    render(<AdminAchievements />)

    expect(await screen.findByText('Primer contacto')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo logro' }))
    fireEvent.change(screen.getByPlaceholderText('Nombre del logro'), {
      target: { value: 'Nuevo logro' },
    })
    fireEvent.change(screen.getByPlaceholderText('Cómo se consigue'), {
      target: { value: 'Consigue 3 contactos' },
    })
    fireEvent.change(screen.getByLabelText('Objetivo'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear logro' }))

    await waitFor(() => {
      expect(mocks.createDefinition).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Nuevo logro',
        description: 'Consigue 3 contactos',
        conditionType: 'contacts',
        conditionTarget: 3,
        isActive: true,
      }))
    })
  })

  it('toggles a definition without opening the form', async () => {
    render(<AdminAchievements />)

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }))

    await waitFor(() => {
      expect(mocks.updateDefinition).toHaveBeenCalledWith('first-contact', expect.objectContaining({
        isActive: false,
      }))
    })
  })
})

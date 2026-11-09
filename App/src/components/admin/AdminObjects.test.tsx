import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AdminObjects } from './AdminObjects'
import type { GameObject } from '../../lib/objects'

const mocks = vi.hoisted(() => {
  const listAllDefinitions = vi.fn()
  const createDefinition = vi.fn()
  const updateDefinition = vi.fn()
  const deleteDefinition = vi.fn()
  return {
    listAllDefinitions,
    createDefinition,
    updateDefinition,
    deleteDefinition,
    repositories: {
      inventory: {
        listAllDefinitions,
        createDefinition,
        updateDefinition,
        deleteDefinition,
      },
    },
  }
})

vi.mock('../../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

const OBJECT: GameObject = {
  id: 'object-01',
  name: 'Teclado Mecánico',
  description: 'Un teclado retro',
  rarity: 'Inusual',
  benefit: 'Estilo retro',
  benefitType: 'Cosmetic',
  benefitValue: 0,
  iconUrl: '/monster-assets/objects/object-01.svg',
  origin: 'BilboStack',
  isActive: true,
}

describe('AdminObjects', () => {
  beforeEach(() => {
    mocks.listAllDefinitions.mockReset().mockResolvedValue([OBJECT])
    mocks.createDefinition.mockReset().mockResolvedValue({ ...OBJECT, id: 'object-custom' })
    mocks.updateDefinition.mockReset().mockResolvedValue(OBJECT)
    mocks.deleteDefinition.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('lists objects and creates a new one', async () => {
    render(<AdminObjects />)

    expect(await screen.findByText('Teclado Mecánico')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo objeto' }))
    fireEvent.change(screen.getByPlaceholderText('Nombre del objeto'), {
      target: { value: 'Objeto custom' },
    })
    fireEvent.change(screen.getByPlaceholderText('Qué hace o representa'), {
      target: { value: 'Descripción custom' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear objeto' }))

    await waitFor(() => {
      expect(mocks.createDefinition).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Objeto custom',
        description: 'Descripción custom',
        rarity: 'Inusual',
        benefitType: 'Cosmetic',
        isActive: true,
      }))
    })
  })

  it('deactivates an object', async () => {
    render(<AdminObjects />)

    fireEvent.click(await screen.findByRole('button', { name: 'Desactivar' }))

    await waitFor(() => {
      expect(mocks.updateDefinition).toHaveBeenCalledWith('object-01', expect.objectContaining({
        isActive: false,
      }))
    })
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AdminQrs } from './AdminQrs'

const mocks = vi.hoisted(() => {
  const list = vi.fn()
  const create = vi.fn()
  const remove = vi.fn()
  const listTalks = vi.fn()
  const listObjects = vi.fn()
  return {
    list,
    create,
    remove,
    listTalks,
    listObjects,
    repositories: {
      qrs: { list, create, delete: remove },
      talks: { list: listTalks },
      inventory: { listAllDefinitions: listObjects },
    },
  }
})

vi.mock('../../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,abc'),
  },
}))

describe('AdminQrs', () => {
  beforeEach(() => {
    mocks.list.mockReset().mockResolvedValue([])
    mocks.create.mockReset().mockResolvedValue({
      id: 'qr-1',
      type: 'talk',
      label: 'Charla de prueba',
      payload: { type: 'talk', talkId: 'talk-01', title: 'Charla de prueba', speaker: 'Ada' },
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    mocks.remove.mockReset().mockResolvedValue(undefined)
    mocks.listTalks.mockReset().mockResolvedValue([{
      talkId: 'talk-01',
      title: 'Charla de prueba',
      speaker: 'Ada Lovelace',
      description: 'Una charla',
    }])
    mocks.listObjects.mockReset().mockResolvedValue([])
  })

  afterEach(() => {
    cleanup()
  })

  it('generates a talk QR from the talk catalog', async () => {
    render(<AdminQrs />)

    await screen.findByText('Todavía no hay QR generados.')
    fireEvent.change(screen.getByLabelText('Referencia'), { target: { value: 'talk-01' } })
    fireEvent.click(screen.getByRole('button', { name: 'Generar QR' }))

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith({
        type: 'talk',
        label: 'Charla de prueba',
        referenceId: 'talk-01',
        description: 'Una charla',
        speaker: 'Ada Lovelace',
      })
    })
  })

  it('switches to event QR and accepts a manual identifier', async () => {
    render(<AdminQrs />)

    await screen.findByText('Todavía no hay QR generados.')
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'event' } })
    fireEvent.change(screen.getByPlaceholderText('npc-01'), { target: { value: 'event-01' } })
    fireEvent.change(screen.getByPlaceholderText('Nombre visible'), {
      target: { value: 'Charla inaugural' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Generar QR' }))

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'event',
        referenceId: 'event-01',
        label: 'Charla inaugural',
      }))
    })
  })
})

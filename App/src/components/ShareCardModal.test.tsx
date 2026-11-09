import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../data/DataProvider'
import { defaultRepositories } from '../data'
import { ShareCardModal } from './ShareCardModal'
import type { Achievement } from '../lib/achievements'
import type { PlayerMetrics } from '../lib/metrics'
import type { User } from '../auth/types'

vi.mock('../lib/share-card-canvas', () => ({
  drawShareCard: vi.fn().mockResolvedValue(undefined),
  downloadShareCard: vi.fn().mockResolvedValue(undefined),
}))

const user: User = {
  id: 'user-1',
  email: 'ana@example.com',
  name: 'Ana Pérez',
  archetype: 'developer',
  role: 'participant',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const metrics: PlayerMetrics = { expertise: 12, auraTech: 8, history: [] }

const achievement: Achievement = {
  id: 'first-contact',
  name: 'Primer contacto',
  description: 'Añade a tu primer contacto',
  icon: '🤝',
  hidden: false,
  condition: () => true,
}

const repositories = {
  ...defaultRepositories,
  achievements: {
    ...defaultRepositories.achievements,
    listDefinitions: async () => [achievement],
    listUnlocked: async () => [{ id: 'first-contact', unlockedAt: '2026-01-01T10:00:00.000Z' }],
  },
}

describe('ShareCardModal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the achievement card with share actions', async () => {
    const onClose = vi.fn()
    const openMock = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(
      <DataProvider repositories={repositories}>
        <ShareCardModal
          open
          onClose={onClose}
          user={user}
          metrics={metrics}
          featuredAchievementId="first-contact"
        />
      </DataProvider>,
    )

    expect(await screen.findByText('Descargar PNG')).toBeTruthy()

    const canvas = screen.getByRole('img', { name: /Primer contacto/ })
    expect(canvas).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'LinkedIn' }))
    await waitFor(() => {
      expect(openMock).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing/share-offsite'),
        '_blank',
        'noopener,noreferrer',
      )
    })
  })
})

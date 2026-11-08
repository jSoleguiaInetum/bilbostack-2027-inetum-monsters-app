import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { FeatureFlagRoute } from './FeatureFlagRoute'

const mocks = vi.hoisted(() => ({
  value: {
    isEnabled: (_key: string): boolean => false,
    loading: false,
  },
}))

vi.mock('../lib/FeatureFlagsProvider', () => ({
  useFeatureFlags: () => mocks.value,
}))

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/inventory']}>
      <Routes>
        <Route path="/my-monster" element={<p>Mi criatura</p>} />
        <Route
          path="/inventory"
          element={(
            <FeatureFlagRoute flag="inventory">
              <p>Inventario</p>
            </FeatureFlagRoute>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('FeatureFlagRoute', () => {
  beforeEach(() => {
    mocks.value = { isEnabled: () => false, loading: false }
  })

  afterEach(() => {
    cleanup()
  })

  it('redirects to the monster page when the flag is disabled', () => {
    renderRoute()

    expect(screen.getByText('Mi criatura')).toBeTruthy()
    expect(screen.queryByText('Inventario')).toBeNull()
  })

  it('renders the children when the flag is enabled', () => {
    mocks.value = { isEnabled: () => true, loading: false }

    renderRoute()

    expect(screen.getByText('Inventario')).toBeTruthy()
  })

  it('waits for the flags before deciding', () => {
    mocks.value = { isEnabled: () => false, loading: true }

    renderRoute()

    expect(screen.getByText('Cargando...')).toBeTruthy()
    expect(screen.queryByText('Mi criatura')).toBeNull()
  })
})

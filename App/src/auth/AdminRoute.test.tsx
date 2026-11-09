import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AdminRoute } from './AdminRoute'

const mocks = vi.hoisted(() => ({
  auth: {
    user: null as { role: string } | null,
    loading: false,
  },
}))

vi.mock('./AuthProvider', () => ({
  useAuth: () => mocks.auth,
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminRoute><p>Panel</p></AdminRoute>} />
        <Route path="/login" element={<p>Login</p>} />
        <Route path="/" element={<p>Inicio</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  afterEach(() => {
    cleanup()
    mocks.auth.user = null
    mocks.auth.loading = false
  })

  it('shows a loading state while the session resolves', () => {
    mocks.auth.loading = true
    renderAt('/admin')

    expect(screen.getByText('Cargando...')).toBeTruthy()
  })

  it('redirects anonymous users to login', () => {
    renderAt('/admin')

    expect(screen.getByText('Login')).toBeTruthy()
  })

  it('redirects non-admin users to the home page', () => {
    mocks.auth.user = { role: 'participant' }
    renderAt('/admin')

    expect(screen.getByText('Inicio')).toBeTruthy()
  })

  it('allows admin role', () => {
    mocks.auth.user = { role: 'admin' }
    renderAt('/admin')
    expect(screen.getByText('Panel')).toBeTruthy()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FeatureFlagsProvider, useFeatureFlags } from './FeatureFlagsProvider'

const mocks = vi.hoisted(() => {
  const list = vi.fn()
  const set = vi.fn()
  return {
    list,
    set,
    repositories: { featureFlags: { list, set } },
  }
})

vi.mock('../data/DataProvider', () => ({
  useRepositories: () => mocks.repositories,
}))

function Probe() {
  const { isEnabled, loading, error, setFlag } = useFeatureFlags()

  return (
    <div>
      <span>{loading ? 'loading' : 'ready'}</span>
      <span>{error ? 'error' : 'ok'}</span>
      <span>{isEnabled('inventory') ? 'enabled' : 'disabled'}</span>
      <button onClick={() => void setFlag('inventory', true)}>enable</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <FeatureFlagsProvider>
      <Probe />
    </FeatureFlagsProvider>,
  )
}

describe('FeatureFlagsProvider', () => {
  beforeEach(() => {
    mocks.list.mockReset()
    mocks.set.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('loads the flags on mount', async () => {
    mocks.list.mockResolvedValue({ inventory: true })

    renderProvider()

    expect(await screen.findByText('enabled')).toBeTruthy()
    expect(screen.getByText('ready')).toBeTruthy()
    expect(screen.getByText('ok')).toBeTruthy()
  })

  it('keeps the MVP defaults when the load fails', async () => {
    mocks.list.mockRejectedValue(new Error('offline'))

    renderProvider()

    expect(await screen.findByText('error')).toBeTruthy()
    expect(screen.getByText('disabled')).toBeTruthy()
    expect(screen.getByText('ready')).toBeTruthy()
  })

  it('persists a flag change and applies the returned values', async () => {
    mocks.list.mockResolvedValue({ inventory: false })
    mocks.set.mockResolvedValue({ inventory: true })

    renderProvider()

    expect(await screen.findByText('ready')).toBeTruthy()
    expect(screen.getByText('disabled')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'enable' }))

    expect(await screen.findByText('enabled')).toBeTruthy()
    expect(mocks.set).toHaveBeenCalledWith('inventory', true)
  })
})

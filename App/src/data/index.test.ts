import { describe, expect, it } from 'vitest'
import { createRepositories } from './index'

describe('data composition root', () => {
  it('returns local repositories in local mode', () => {
    const repositories = createRepositories('local')

    expect(repositories.auth).toBeDefined()
    expect(repositories.talks).toBeDefined()
    expect(repositories.rankings).toBeDefined()
    expect(repositories.dashboard).toBeDefined()
    expect(repositories.inventory).toBeDefined()
    expect(repositories.featureFlags).toBeDefined()
  })

  it('returns API repositories in API mode', () => {
    const repositories = createRepositories('api')

    expect(repositories.auth).toBeDefined()
    expect(repositories.achievements).toBeDefined()
    expect(repositories.rankings).toBeDefined()
    expect(repositories.dashboard).toBeDefined()
    expect(repositories.inventory).toBeDefined()
    expect(repositories.featureFlags).toBeDefined()
  })
})

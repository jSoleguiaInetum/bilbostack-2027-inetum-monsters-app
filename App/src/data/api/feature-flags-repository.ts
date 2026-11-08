import type { FeatureFlagsRepository } from '../ports'
import { toFeatureFlags, type FeatureFlagsDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiFeatureFlagsRepository(client: HttpClient): FeatureFlagsRepository {
  async function list() {
    return toFeatureFlags(await client.request<FeatureFlagsDto>('/feature-flags'))
  }

  async function set(
    key: Parameters<FeatureFlagsRepository['set']>[0],
    enabled: boolean,
  ) {
    const dto = await client.request<FeatureFlagsDto>(
      `/feature-flags/${encodeURIComponent(key)}`,
      { method: 'PATCH', body: { enabled } },
    )
    return toFeatureFlags(dto)
  }

  return { list, set }
}

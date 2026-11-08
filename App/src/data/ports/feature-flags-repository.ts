import type { FeatureFlagKey, FeatureFlagValues } from '../../lib/feature-flags'

export interface FeatureFlagsRepository {
  list(): Promise<FeatureFlagValues>
  set(key: FeatureFlagKey, enabled: boolean): Promise<FeatureFlagValues>
}

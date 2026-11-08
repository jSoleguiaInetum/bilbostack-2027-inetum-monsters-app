import {
  resolveFeatureFlags,
  type FeatureFlagKey,
  type FeatureFlagValues,
} from '../../lib/feature-flags'
import type { FeatureFlagsRepository } from '../ports/feature-flags-repository'
import { readJson, STORAGE_KEYS, writeJson } from './storage'

function readFlags(): FeatureFlagValues {
  return resolveFeatureFlags(readJson<Partial<Record<string, unknown>>>(
    STORAGE_KEYS.featureFlags,
    {},
  ))
}

async function list(): Promise<FeatureFlagValues> {
  return readFlags()
}

async function set(key: FeatureFlagKey, enabled: boolean): Promise<FeatureFlagValues> {
  const flags = { ...readFlags(), [key]: enabled }
  writeJson(STORAGE_KEYS.featureFlags, flags)
  return flags
}

export const localFeatureFlagsRepository: FeatureFlagsRepository = { list, set }

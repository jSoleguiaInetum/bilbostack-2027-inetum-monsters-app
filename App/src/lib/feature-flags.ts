export type FeatureFlagKey = 'inventory'

export interface FeatureFlagDefinition {
  key: FeatureFlagKey
  name: string
  description: string
  defaultValue: boolean
}

export const FEATURE_FLAG_DEFINITIONS: readonly FeatureFlagDefinition[] = [
  {
    key: 'inventory',
    name: 'Inventario',
    description: 'Permite a los participantes ver los objetos que han obtenido.',
    defaultValue: false,
  },
]

export type FeatureFlagValues = Record<FeatureFlagKey, boolean>

export function defaultFeatureFlags(): FeatureFlagValues {
  const flags = {} as FeatureFlagValues
  for (const definition of FEATURE_FLAG_DEFINITIONS) {
    flags[definition.key] = definition.defaultValue
  }
  return flags
}

export function resolveFeatureFlags(
  overrides: Partial<Record<string, unknown>> | null | undefined,
): FeatureFlagValues {
  const flags = defaultFeatureFlags()
  if (!overrides) return flags

  for (const definition of FEATURE_FLAG_DEFINITIONS) {
    const value = overrides[definition.key]
    if (typeof value === 'boolean') flags[definition.key] = value
  }

  return flags
}

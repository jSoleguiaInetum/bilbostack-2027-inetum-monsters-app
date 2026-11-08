import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRepositories } from '../data/DataProvider'
import {
  defaultFeatureFlags,
  type FeatureFlagKey,
  type FeatureFlagValues,
} from './feature-flags'

interface FeatureFlagsContextValue {
  flags: FeatureFlagValues
  loading: boolean
  error: boolean
  isEnabled: (key: FeatureFlagKey) => boolean
  setFlag: (key: FeatureFlagKey, enabled: boolean) => Promise<void>
  refresh: () => void
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { featureFlags } = useRepositories()
  const [flags, setFlags] = useState<FeatureFlagValues>(() => defaultFeatureFlags())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)

    featureFlags.list()
      .then(nextFlags => {
        if (!active) return
        setFlags(nextFlags)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setError(true)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [featureFlags, reloadKey])

  const setFlag = useCallback(async (key: FeatureFlagKey, enabled: boolean) => {
    const nextFlags = await featureFlags.set(key, enabled)
    setFlags(nextFlags)
    setError(false)
  }, [featureFlags])

  const refresh = useCallback(() => {
    setReloadKey(key => key + 1)
  }, [])

  const value = useMemo<FeatureFlagsContextValue>(() => ({
    flags,
    loading,
    error,
    isEnabled: key => flags[key],
    setFlag,
    refresh,
  }), [flags, loading, error, setFlag, refresh])

  return <FeatureFlagsContext value={value}>{children}</FeatureFlagsContext>
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error('useFeatureFlags debe usarse dentro de FeatureFlagsProvider')
  }
  return context
}

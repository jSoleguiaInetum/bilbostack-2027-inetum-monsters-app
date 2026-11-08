import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useFeatureFlags } from '../lib/FeatureFlagsProvider'
import type { FeatureFlagKey } from '../lib/feature-flags'

interface FeatureFlagRouteProps {
  flag: FeatureFlagKey
  children: ReactNode
}

export function FeatureFlagRoute({ flag, children }: FeatureFlagRouteProps) {
  const { isEnabled, loading } = useFeatureFlags()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-tech animate-pulse">Cargando...</div>
      </div>
    )
  }

  if (!isEnabled(flag)) return <Navigate to="/my-monster" replace />

  return <>{children}</>
}

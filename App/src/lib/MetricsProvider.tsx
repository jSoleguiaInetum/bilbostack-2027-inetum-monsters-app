import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getMetrics, initializeMetrics, addReward, type PlayerMetrics, type ActionType } from './metrics'
import { checkAchievements, type UnlockedAchievement } from './achievements'
import { AchievementToast } from '../components/AchievementToast'
import { useAuth } from '../auth/AuthProvider'
import type { Archetype } from '../monster/types'

interface MetricsContextValue {
  metrics: PlayerMetrics
  addMetricsReward: (action: ActionType, contactArchetype?: Archetype) => PlayerMetrics
  refreshMetrics: () => void
}

const MetricsContext = createContext<MetricsContextValue | null>(null)

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<PlayerMetrics>({ expertise: 0, auraTech: 0, history: [] })
  const [toastQueue, setToastQueue] = useState<UnlockedAchievement[]>([])
  const [currentToast, setCurrentToast] = useState<UnlockedAchievement | null>(null)

  useEffect(() => {
    if (user) {
      setMetrics(getMetrics(user.id))
    }
  }, [user])

  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      setCurrentToast(toastQueue[0])
      setToastQueue(q => q.slice(1))
    }
  }, [currentToast, toastQueue])

  const handleAchievementCheck = useCallback((updatedMetrics: PlayerMetrics) => {
    if (!user) return
    const newlyUnlocked = checkAchievements(user.id, updatedMetrics)
    if (newlyUnlocked.length > 0) {
      setToastQueue(q => [...q, ...newlyUnlocked])
    }
  }, [user])

  const refreshMetrics = useCallback(() => {
    if (user) {
      const m = getMetrics(user.id)
      setMetrics(m)
      handleAchievementCheck(m)
    }
  }, [user, handleAchievementCheck])

  const addMetricsRewardCb = useCallback((action: ActionType, contactArchetype?: Archetype): PlayerMetrics => {
    if (!user) return metrics
    const updated = addReward(user.id, action, contactArchetype, user.archetype)
    setMetrics(updated)
    handleAchievementCheck(updated)
    return updated
  }, [user, metrics, handleAchievementCheck])

  return (
    <MetricsContext value={{ metrics, addMetricsReward: addMetricsRewardCb, refreshMetrics }}>
      {children}
      <AchievementToast
        achievement={currentToast}
        onDismiss={() => setCurrentToast(null)}
      />
    </MetricsContext>
  )
}

export function useMetrics(): MetricsContextValue {
  const context = useContext(MetricsContext)
  if (!context) throw new Error('useMetrics debe usarse dentro de MetricsProvider')
  return context
}

export function initPlayerMetrics(userId: string, rarityName: string): PlayerMetrics {
  return initializeMetrics(userId, rarityName)
}

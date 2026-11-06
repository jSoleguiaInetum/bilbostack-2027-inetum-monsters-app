import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { emptyMetrics, type PlayerMetrics, type ActionType } from './metrics'
import type { AchievementContext, UnlockedAchievement } from './achievements'
import { AchievementToast } from '../components/AchievementToast'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import type { Archetype } from '../monster/types'

interface MetricsContextValue {
  metrics: PlayerMetrics
  addMetricsReward: (action: ActionType, contactArchetype?: Archetype) => Promise<PlayerMetrics>
  refreshMetrics: () => Promise<void>
}

const MetricsContext = createContext<MetricsContextValue | null>(null)

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const {
    metrics: metricsRepository,
    contacts: contactsRepository,
    battles: battlesRepository,
    achievements: achievementsRepository,
  } = useRepositories()
  const [metrics, setMetrics] = useState<PlayerMetrics>(emptyMetrics())
  const [toastQueue, setToastQueue] = useState<UnlockedAchievement[]>([])
  const [currentToast, setCurrentToast] = useState<UnlockedAchievement | null>(null)

  useEffect(() => {
    if (!user) {
      setMetrics(emptyMetrics())
      return
    }

    let active = true
    metricsRepository.get(user.id).then((current) => {
      if (active) setMetrics(current)
    }).catch(() => {
      if (active) setMetrics(emptyMetrics())
    })

    return () => {
      active = false
    }
  }, [user, metricsRepository])

  useEffect(() => {
    if (!currentToast && toastQueue.length > 0) {
      setCurrentToast(toastQueue[0])
      setToastQueue(q => q.slice(1))
    }
  }, [currentToast, toastQueue])

  const handleAchievementCheck = useCallback(async (updatedMetrics: PlayerMetrics) => {
    if (!user) return

    const [allContacts, allBattles] = await Promise.all([
      contactsRepository.list(user.id),
      battlesRepository.list(user.id),
    ])
    const context: AchievementContext = {
      userId: user.id,
      metrics: updatedMetrics,
      contactCount: allContacts.length,
      battleCount: allBattles.length,
      battleWins: allBattles.filter(b => b.outcome === 'win').length,
      uniqueArchetypesContacted: new Set(allContacts.map(c => c.archetype)).size,
    }
    const newlyUnlocked = await achievementsRepository.checkAndUnlock(user.id, context)
    if (newlyUnlocked.length > 0) {
      setToastQueue(q => [...q, ...newlyUnlocked])
    }
  }, [user, contactsRepository, battlesRepository, achievementsRepository])

  const refreshMetrics = useCallback(async () => {
    if (!user) return
    const current = await metricsRepository.get(user.id)
    setMetrics(current)
    await handleAchievementCheck(current)
  }, [user, metricsRepository, handleAchievementCheck])

  const addMetricsRewardCb = useCallback(async (
    action: ActionType,
    contactArchetype?: Archetype,
  ): Promise<PlayerMetrics> => {
    if (!user) return metrics
    const updated = await metricsRepository.addReward(user.id, action, contactArchetype, user.archetype)
    setMetrics(updated)
    await handleAchievementCheck(updated)
    return updated
  }, [user, metrics, metricsRepository, handleAchievementCheck])

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

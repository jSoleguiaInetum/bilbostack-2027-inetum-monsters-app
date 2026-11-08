import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { emptyMetrics, type PlayerMetrics, type ActionType } from './metrics'
import type { AchievementContext, UnlockedAchievement } from './achievements'
import type { Mission } from './missions'
import { AchievementToast } from '../components/AchievementToast'
import { MissionToast } from '../components/MissionToast'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { useFeatureFlags } from './FeatureFlagsProvider'
import type { Archetype } from '../monster/types'

interface MetricsContextValue {
  metrics: PlayerMetrics
  addMetricsReward: (action: ActionType, contactArchetype?: Archetype) => Promise<PlayerMetrics>
  refreshMetrics: () => Promise<void>
}

const MetricsContext = createContext<MetricsContextValue | null>(null)

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { isEnabled } = useFeatureFlags()
  const {
    metrics: metricsRepository,
    contacts: contactsRepository,
    battles: battlesRepository,
    achievements: achievementsRepository,
    missions: missionsRepository,
  } = useRepositories()
  const [metrics, setMetrics] = useState<PlayerMetrics>(emptyMetrics())
  const [toastQueue, setToastQueue] = useState<UnlockedAchievement[]>([])
  const [currentToast, setCurrentToast] = useState<UnlockedAchievement | null>(null)
  const [missionQueue, setMissionQueue] = useState<Mission[]>([])
  const [currentMission, setCurrentMission] = useState<Mission | null>(null)

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

  useEffect(() => {
    if (!currentMission && missionQueue.length > 0) {
      setCurrentMission(missionQueue[0])
      setMissionQueue(q => q.slice(1))
    }
  }, [currentMission, missionQueue])

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

  const handleProgressCheck = useCallback(async (
    updatedMetrics: PlayerMetrics,
  ): Promise<PlayerMetrics> => {
    await handleAchievementCheck(updatedMetrics)
    if (!user || !isEnabled('missions')) return updatedMetrics

    const result = await missionsRepository.checkAndComplete(user.id)
    if (result.completed.length === 0) return updatedMetrics

    setMetrics(result.metrics)
    setMissionQueue(q => [...q, ...result.completed])
    await handleAchievementCheck(result.metrics)
    return result.metrics
  }, [user, isEnabled, missionsRepository, handleAchievementCheck])

  const refreshMetrics = useCallback(async () => {
    if (!user) return
    const current = await metricsRepository.get(user.id)
    setMetrics(current)
    await handleProgressCheck(current)
  }, [user, metricsRepository, handleProgressCheck])

  const addMetricsRewardCb = useCallback(async (
    action: ActionType,
    contactArchetype?: Archetype,
  ): Promise<PlayerMetrics> => {
    if (!user) return metrics
    const updated = await metricsRepository.addReward(user.id, action, contactArchetype, user.archetype)
    setMetrics(updated)
    return handleProgressCheck(updated)
  }, [user, metrics, metricsRepository, handleProgressCheck])

  return (
    <MetricsContext value={{ metrics, addMetricsReward: addMetricsRewardCb, refreshMetrics }}>
      {children}
      <AchievementToast
        achievement={currentToast}
        onDismiss={() => setCurrentToast(null)}
      />
      <MissionToast
        mission={currentToast || toastQueue.length > 0 ? null : currentMission}
        onDismiss={() => setCurrentMission(null)}
      />
    </MetricsContext>
  )
}

export function useMetrics(): MetricsContextValue {
  const context = useContext(MetricsContext)
  if (!context) throw new Error('useMetrics debe usarse dentro de MetricsProvider')
  return context
}

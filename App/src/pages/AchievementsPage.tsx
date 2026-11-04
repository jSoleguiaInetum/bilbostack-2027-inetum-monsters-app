import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useMetrics } from '../lib/MetricsProvider'
import { ACHIEVEMENT_DEFINITIONS, getUnlockedAchievements, buildContext } from '../lib/achievements'

export function AchievementsPage() {
  const { user } = useAuth()
  const { metrics } = useMetrics()
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      const unlocked = getUnlockedAchievements(user.id)
      setUnlockedIds(new Set(unlocked.map(a => a.id)))
    }
  }, [user, metrics])

  if (!user) return null

  const ctx = buildContext(user.id, metrics)
  const visibleAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => !a.hidden || unlockedIds.has(a.id))

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Logros</h1>
        <span className="text-gray-500 text-sm">{unlockedIds.size}/{ACHIEVEMENT_DEFINITIONS.length}</span>
      </header>

      <main className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">
          {visibleAchievements.map(achievement => {
            const isUnlocked = unlockedIds.has(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`snes-blockquote p-3 flex items-center gap-3 transition-all ${isUnlocked ? 'is-selected' : 'opacity-50'}`}
              >
                <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                  {isUnlocked ? achievement.icon : '🔒'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.name}
                  </p>
                  <p className={`text-[10px] ${isUnlocked ? 'text-tech' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                </div>
                {isUnlocked && <span className="text-nature text-xs">✓</span>}
              </div>
            )
          })}
        </div>

        <div className="mt-6 snes-blockquote p-3 text-center">
          <p className="text-gray-500 text-[10px] mb-2">Progreso</p>
          <div className="flex gap-4 justify-center text-xs">
            <span className="text-gray-400">👥 {ctx.contactCount} contactos</span>
            <span className="text-gray-400">⚔️ {ctx.battleCount} combates</span>
            <span className="text-gray-400">🏆 {ctx.battleWins} victorias</span>
          </div>
        </div>
      </main>
    </div>
  )
}

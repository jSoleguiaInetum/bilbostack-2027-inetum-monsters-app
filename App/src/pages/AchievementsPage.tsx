import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useMetrics } from '../lib/MetricsProvider'
import { useRepositories } from '../data/DataProvider'
import { ShareCardModal } from '../components/ShareCardModal'
import type { Achievement, AchievementContext } from '../lib/achievements'

export function AchievementsPage() {
  const { user } = useAuth()
  const { metrics } = useMetrics()
  const { achievements, contacts, battles } = useRepositories()
  const [definitions, setDefinitions] = useState<Achievement[]>([])
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [context, setContext] = useState<AchievementContext | null>(null)
  const [shareAchievementId, setShareAchievementId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    let active = true
    Promise.all([
      achievements.listDefinitions(),
      achievements.listUnlocked(user.id),
      contacts.list(user.id),
      battles.list(user.id),
    ]).then(([availableAchievements, unlocked, allContacts, allBattles]) => {
      if (!active) return
      setDefinitions(availableAchievements)
      setUnlockedIds(new Set(unlocked.map(achievement => achievement.id)))
      setContext({
        userId: user.id,
        metrics,
        contactCount: allContacts.length,
        battleCount: allBattles.length,
        battleWins: allBattles.filter(battle => battle.outcome === 'win').length,
        uniqueArchetypesContacted: new Set(allContacts.map(contact => contact.archetype)).size,
      })
    }).catch(() => {
      if (!active) return
      setDefinitions([])
      setUnlockedIds(new Set())
      setContext(null)
    })

    return () => {
      active = false
    }
  }, [user, metrics, achievements, contacts, battles])

  if (!user) return null

  const visibleAchievements = definitions.filter(a => !a.hidden || unlockedIds.has(a.id))

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Logros</h1>
        <span className="text-gray-500 text-sm">{unlockedIds.size}/{definitions.length}</span>
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
                {isUnlocked && (
                  <button
                    onClick={() => setShareAchievementId(achievement.id)}
                    aria-label={`Compartir ${achievement.name}`}
                    className="text-lg text-tech hover:text-white transition-colors"
                  >
                    📤
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 snes-blockquote p-3 text-center">
          <p className="text-gray-500 text-[10px] mb-2">Progreso</p>
          <div className="flex gap-4 justify-center text-xs">
            <span className="text-gray-400">👥 {context?.contactCount ?? 0} contactos</span>
            <span className="text-gray-400">⚔️ {context?.battleCount ?? 0} combates</span>
            <span className="text-gray-400">🏆 {context?.battleWins ?? 0} victorias</span>
          </div>
        </div>
      </main>

      <ShareCardModal
        open={shareAchievementId !== null}
        onClose={() => setShareAchievementId(null)}
        user={user}
        metrics={metrics}
        featuredAchievementId={shareAchievementId ?? undefined}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { useMetrics } from '../lib/MetricsProvider'
import { useFeatureFlags } from '../lib/FeatureFlagsProvider'
import { useRepositories } from '../data/DataProvider'
import { MonsterCard } from '../monster/MonsterCard'
import { MonsterSkeleton } from '../components/MonsterSkeleton'
import { MetricsDisplay } from '../components/MetricsDisplay'
import { EvolutionProgress } from '../components/EvolutionProgress'
import { RarityBadge } from '../monster/RarityBadge'
import { generateMonster } from '../monster/generator'
import { getEvolutionStage } from '../lib/evolution'
import { ARCHETYPES } from '../lib/constants'
import type { Achievement } from '../lib/achievements'
import type { MonsterParams } from '../monster/types'

interface RecentAchievement {
  id: string
  name: string
  icon: string
  unlockedAt: string
}

interface HomeAction {
  path: string
  icon: string
  label: string
}

function formatUnlockedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function HomePage() {
  const { user } = useAuth()
  const { metrics } = useMetrics()
  const { isEnabled } = useFeatureFlags()
  const { achievements } = useRepositories()
  const [params, setParams] = useState<MonsterParams | null>(null)
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([])
  const [achievementsLoaded, setAchievementsLoaded] = useState(false)

  useEffect(() => {
    if (!user) return

    let active = true
    generateMonster(user.email).then(({ params }) => {
      if (active) setParams(params)
    })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    let active = true
    setAchievementsLoaded(false)
    Promise.all([
      achievements.listDefinitions(),
      achievements.listUnlocked(user.id),
    ]).then(([definitions, unlocked]) => {
      if (!active) return

      const definitionsById = new Map<string, Achievement>(
        definitions.map(achievement => [achievement.id, achievement]),
      )
      const recent = [...unlocked]
        .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
        .slice(0, 3)
        .flatMap((entry) => {
          const definition = definitionsById.get(entry.id)
          if (!definition) return []
          return [{
            id: definition.id,
            name: definition.name,
            icon: definition.icon,
            unlockedAt: entry.unlockedAt,
          }]
        })

      setRecentAchievements(recent)
      setAchievementsLoaded(true)
    }).catch(() => {
      if (!active) return
      setRecentAchievements([])
      setAchievementsLoaded(true)
    })

    return () => {
      active = false
    }
  }, [user, achievements])

  if (!user) return null

  const archetypeInfo = ARCHETYPES.find(archetype => archetype.key === user.archetype)
  const evolution = getEvolutionStage(metrics)

  const actions: HomeAction[] = [
    { path: '/my-monster', icon: '🐾', label: 'Mi Criatura' },
    { path: '/qr', icon: '📱', label: 'Mi QR' },
    { path: '/scan', icon: '📷', label: 'Escanear QR' },
    { path: '/contacts', icon: '🤝', label: 'Contactos' },
    { path: '/achievements', icon: '🏅', label: 'Logros' },
  ]
  if (isEnabled('inventory')) {
    actions.push({ path: '/inventory', icon: '🎒', label: 'Inventario' })
  }
  actions.push({ path: '/rankings', icon: '🏆', label: 'Rankings' })
  if (isEnabled('missions')) {
    actions.push({ path: '/missions', icon: '🎯', label: 'Misiones' })
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="px-5 py-4 border-b border-primary">
        <p className="text-tech text-[10px]">BilboStack 2027</p>
        <h1 className="text-lg font-bold text-white">Hola, {user.name}</h1>
      </header>

      <main className="flex flex-col gap-5 px-4 py-5">
        <section className="snes-blockquote p-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          {params ? (
            <MonsterCard params={params} archetype={user.archetype} evolution={evolution} size={150} />
          ) : (
            <MonsterSkeleton size={150} />
          )}
          <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <p className="text-xl font-bold text-white">{user.name}</p>
            <p className="text-tech text-sm">{archetypeInfo?.icon} {archetypeInfo?.name}</p>
            {params && <RarityBadge rarity={params.rarity} />}
            <MetricsDisplay metrics={metrics} />
          </div>
        </section>

        <div className="flex justify-center">
          <EvolutionProgress metrics={metrics} />
        </div>

        <section aria-labelledby="recent-achievements-title">
          <div className="flex items-center justify-between mb-2">
            <h2 id="recent-achievements-title" className="text-sm font-bold text-white">Logros recientes</h2>
            <Link to="/achievements" className="snes-link text-tech text-[10px]">Ver todos</Link>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  data-testid="recent-achievement"
                  className="snes-blockquote p-3 flex items-center gap-3"
                >
                  <span className="text-xl" aria-hidden="true">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{achievement.name}</p>
                    <p className="text-gray-500 text-[10px]">{formatUnlockedAt(achievement.unlockedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="snes-blockquote p-4 text-center">
              <p className="text-gray-500 text-[10px]">
                {achievementsLoaded
                  ? 'Todavía no desbloqueaste logros. ¡Empezá escaneando un QR!'
                  : 'Cargando logros...'}
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="quick-actions-title">
          <h2 id="quick-actions-title" className="text-sm font-bold text-white mb-2">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(action => (
              <Link
                key={action.path}
                to={action.path}
                className="snes-blockquote flex items-center gap-3 p-3 min-h-16 no-underline hover:border-secondary transition-colors"
              >
                <span className="text-2xl" aria-hidden="true">{action.icon}</span>
                <span className="text-[10px] font-bold text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

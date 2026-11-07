import { useEffect, useState } from 'react'
import { useRepositories } from '../data/DataProvider'
import { Spinner } from '../components/Spinner'
import { ARCHETYPES } from '../lib/constants'
import { EVOLUTION_THRESHOLDS } from '../lib/evolution'
import type { PublicDashboard, RecentEvolution } from '../lib/dashboard'
import type { RankingCategory, RankingEntry } from '../lib/rankings'

export const PUBLIC_DASHBOARD_REFRESH_MS = 30_000
export const DASHBOARD_RANKINGS_LIMIT = 5
export const DASHBOARD_EVOLUTIONS_LIMIT = 8

const CATEGORY_META: Array<{ category: RankingCategory; label: string; icon: string }> = [
  { category: 'aura', label: 'Aura Tech', icon: '✨' },
  { category: 'expertise', label: 'Expertise', icon: '⚡' },
  { category: 'contacts', label: 'Contactos', icon: '👥' },
  { category: 'wins', label: 'Victorias', icon: '⚔️' },
]

const STAGE_ICONS: Record<RecentEvolution['stage'], string> = {
  0: '🥚',
  1: '🐣',
  2: '🦎',
  3: '🐉',
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-primary bg-surface px-4 py-3">
      <p className="text-[9px] text-gray-500">{icon} {label}</p>
      <p className="mt-2 text-2xl font-bold text-tech md:text-3xl">{value}</p>
    </div>
  )
}

function RankingPanel({
  label,
  icon,
  entries,
}: {
  label: string
  icon: string
  entries: RankingEntry[]
}) {
  return (
    <section className="rounded-lg border border-primary bg-surface p-4">
      <h2 className="mb-3 text-[11px] font-bold text-accent">{icon} {label}</h2>
      {entries.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {entries.map(entry => {
            const archetype = ARCHETYPES.find(item => item.key === entry.archetype)
            return (
              <li key={entry.userId} className="flex items-center gap-2">
                <span className="w-5 text-center text-[10px] font-bold text-accent">{entry.rank}</span>
                <span className="text-sm">{archetype?.icon ?? '🐾'}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] text-white">{entry.name}</span>
                <span className="text-[11px] font-bold text-tech">{entry.score}</span>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-[9px] text-gray-500">Sin datos todavía</p>
      )}
    </section>
  )
}

function EvolutionFeed({ evolutions }: { evolutions: RecentEvolution[] }) {
  return (
    <section className="rounded-lg border border-primary bg-surface p-4">
      <h2 className="mb-3 text-[11px] font-bold text-accent">🧬 Evoluciones recientes</h2>
      {evolutions.length > 0 ? (
        <ul className="grid gap-2 md:grid-cols-2">
          {evolutions.map(evolution => {
            const archetype = ARCHETYPES.find(item => item.key === evolution.archetype)
            const stageLabel = EVOLUTION_THRESHOLDS.find(
              threshold => threshold.stage === evolution.stage,
            )?.label ?? 'Evolución'

            return (
              <li
                key={`${evolution.userId}-${evolution.evolvedAt}`}
                className="flex items-center gap-2 rounded-lg border border-primary bg-dark px-3 py-2"
              >
                <span className="text-lg">{STAGE_ICONS[evolution.stage]}</span>
                <span className="text-sm">{archetype?.icon ?? '🐾'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-white">{evolution.name}</p>
                  <p className="text-[8px] text-gray-500">
                    {stageLabel} · {evolution.totalPoints} pts
                  </p>
                </div>
                <span className="text-[9px] text-tech">{formatTime(evolution.evolvedAt)}</span>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-[9px] text-gray-500">Aún no hay evoluciones registradas</p>
      )}
    </section>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-4xl">📡</p>
      <p className="mb-2 font-bold text-white">No se pudo cargar el dashboard</p>
      <p className="mb-6 text-xs text-gray-500">Revisa la conexión e intenta de nuevo.</p>
      <button onClick={onRetry} className="snes-button has-rose-color">
        Reintentar
      </button>
    </div>
  )
}

export function PublicDashboardPage() {
  const { dashboard: dashboardRepository } = useRepositories()
  const [dashboard, setDashboard] = useState<PublicDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load(showLoading: boolean) {
      if (showLoading) {
        setLoading(true)
        setDashboard(null)
      }

      try {
        const data = await dashboardRepository.getOverview({
          rankingsLimit: DASHBOARD_RANKINGS_LIMIT,
          evolutionsLimit: DASHBOARD_EVOLUTIONS_LIMIT,
        })
        if (!active) return
        setDashboard(data)
        setError(false)
      } catch {
        if (!active) return
        setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load(true)
    const interval = window.setInterval(() => {
      void load(false)
    }, PUBLIC_DASHBOARD_REFRESH_MS)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [dashboardRepository, reloadKey])

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size={48} />
      </div>
    )
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-background">
        <ErrorState onRetry={() => setReloadKey(key => key + 1)} />
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white md:text-3xl">BilboStack 2027</h1>
          <p className="mt-2 text-[10px] text-gray-500 md:text-xs">
            Dashboard público · rankings, estadísticas y evoluciones en directo
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary px-3 py-1 text-[9px] font-bold text-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
          EN VIVO · 30 s
        </span>
      </header>

      {error && (
        <p className="mb-4 rounded-lg border border-secondary/50 px-3 py-2 text-[9px] text-secondary">
          No se pudo actualizar. Mostrando los últimos datos disponibles.
        </p>
      )}

      <section aria-label="Estadísticas globales" className="mb-6 grid grid-cols-2 gap-3 md:mb-8 lg:grid-cols-4">
        <StatCard icon="👾" label="Participantes" value={dashboard.stats.totalUsers} />
        <StatCard icon="⚔️" label="Combates" value={dashboard.stats.totalBattles} />
        <StatCard icon="🤝" label="Contactos" value={dashboard.stats.totalContacts} />
        <StatCard icon="🏆" label="Logros" value={dashboard.stats.totalAchievements} />
      </section>

      <section aria-label="Rankings" className="mb-6 grid gap-4 md:mb-8 lg:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_META.map(meta => (
          <RankingPanel
            key={meta.category}
            label={meta.label}
            icon={meta.icon}
            entries={dashboard.rankings[meta.category]}
          />
        ))}
      </section>

      <EvolutionFeed evolutions={dashboard.recentEvolutions} />
    </div>
  )
}

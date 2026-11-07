import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { Spinner } from '../components/Spinner'
import { ARCHETYPES } from '../lib/constants'
import type { Ranking, RankingCategory, RankingEntry } from '../lib/rankings'

export const RANKINGS_REFRESH_MS = 30_000
const RANKINGS_LIMIT = 20

const TABS: Array<{ category: RankingCategory; label: string; icon: string }> = [
  { category: 'aura', label: 'Aura Tech', icon: '✨' },
  { category: 'expertise', label: 'Expertise', icon: '⚡' },
  { category: 'contacts', label: 'Contactos', icon: '👥' },
  { category: 'wins', label: 'Victorias', icon: '⚔️' },
]

function rankLabel(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return String(rank)
}

function RankingRow({ entry, isCurrentUser }: { entry: RankingEntry; isCurrentUser: boolean }) {
  const archetypeInfo = ARCHETYPES.find(archetype => archetype.key === entry.archetype)

  return (
    <li
      aria-current={isCurrentUser ? 'true' : undefined}
      className={[
        'flex items-center gap-3 rounded-lg border px-3 py-2',
        isCurrentUser ? 'border-secondary bg-dark' : 'border-primary bg-surface',
      ].join(' ')}
    >
      <span className="w-8 text-center text-xs font-bold text-accent">
        {rankLabel(entry.rank)}
      </span>
      <span className="text-lg">{archetypeInfo?.icon ?? '🐾'}</span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[11px] font-bold ${isCurrentUser ? 'text-secondary' : 'text-white'}`}>
          {entry.name}
          {isCurrentUser && <span className="ml-2 text-[8px] text-accent">TÚ</span>}
        </p>
        <p className="text-[8px] text-gray-500">{archetypeInfo?.name ?? entry.archetype}</p>
      </div>
      <span className="text-sm font-bold text-tech">{entry.score}</span>
    </li>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-4xl">📡</p>
      <p className="mb-2 font-bold text-white">No se pudieron cargar los rankings</p>
      <p className="mb-6 text-xs text-gray-500">Revisa tu conexión e intenta de nuevo.</p>
      <button onClick={onRetry} className="snes-button has-rose-color">
        Reintentar
      </button>
    </div>
  )
}

export function RankingsPage() {
  const { user } = useAuth()
  const { rankings } = useRepositories()
  const [category, setCategory] = useState<RankingCategory>('aura')
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!user) return

    const currentUserId = user.id
    let active = true

    async function load(showLoading: boolean) {
      if (showLoading) {
        setLoading(true)
        setRanking(null)
      }

      try {
        const data = await rankings.getByCategory(category, {
          limit: RANKINGS_LIMIT,
          currentUserId,
        })
        if (!active) return
        setRanking(data)
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
    }, RANKINGS_REFRESH_MS)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [user, category, rankings, reloadKey])

  if (!user) return null

  const activeTab = TABS.find(tab => tab.category === category) ?? TABS[0]
  const currentUserIsVisible = ranking?.entries.some(entry => entry.userId === user.id) ?? false

  return (
    <div className="flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-primary px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-white">Rankings</h1>
          <p className="mt-1 text-[8px] text-gray-500">Top 20 · se actualiza cada 30 s</p>
        </div>
        {ranking && <span className="text-[9px] text-gray-500">{ranking.entries.length} jugadores</span>}
      </header>

      <div
        role="tablist"
        aria-label="Categorías de ranking"
        className="grid grid-cols-2 gap-2 px-4 pt-4"
      >
        {TABS.map(tab => {
          const isActive = tab.category === category
          return (
            <button
              key={tab.category}
              id={`ranking-tab-${tab.category}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="rankings-panel"
              onClick={() => setCategory(tab.category)}
              className={[
                'flex items-center justify-center gap-2 rounded-lg border px-2 py-2 text-[9px] font-bold transition-colors',
                isActive
                  ? 'border-accent bg-dark text-accent'
                  : 'border-primary bg-surface text-gray-500 hover:text-white',
              ].join(' ')}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      <main
        id="rankings-panel"
        role="tabpanel"
        aria-labelledby={`ranking-tab-${activeTab.category}`}
        className="flex-1 px-4 py-4"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={40} />
          </div>
        ) : error && !ranking ? (
          <ErrorState onRetry={() => setReloadKey(key => key + 1)} />
        ) : (
          <>
            {error && (
              <p className="mb-3 rounded-lg border border-secondary/50 px-3 py-2 text-[9px] text-secondary">
                No se pudo actualizar. Mostrando los últimos datos.
              </p>
            )}

            {ranking && ranking.entries.length > 0 ? (
              <ol className="flex flex-col gap-2">
                {ranking.entries.map(entry => (
                  <RankingRow
                    key={entry.userId}
                    entry={entry}
                    isCurrentUser={entry.userId === user.id}
                  />
                ))}
              </ol>
            ) : (
              <div className="py-12 text-center">
                <p className="mb-4 text-4xl">🏁</p>
                <p className="mb-2 font-bold text-white">Sin participantes todavía</p>
                <p className="text-xs text-gray-500">Suma puntos para aparecer en el ranking.</p>
              </div>
            )}

            {ranking?.currentUser && !currentUserIsVisible && (
              <div className="mt-5">
                <p className="mb-2 text-[9px] font-bold text-gray-500">TU POSICIÓN</p>
                <ol>
                  <RankingRow entry={ranking.currentUser} isCurrentUser />
                </ol>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

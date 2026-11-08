import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { useMetrics } from '../lib/MetricsProvider'
import type { GameObject } from '../lib/objects'
import type {
  MissionObjectiveType,
  MissionProgress,
} from '../lib/missions'

const OBJECTIVE_ICONS: Record<MissionObjectiveType, string> = {
  contacts: '🤝',
  battles: '⚔️',
  battle_wins: '🏆',
  talks: '🎤',
  archetypes: '🎭',
  achievements: '🏅',
  expertise: '⚡',
  aura: '✨',
}

function rewardLabels(
  progress: MissionProgress,
  objectsById: Map<string, GameObject>,
): string[] {
  const { reward } = progress.mission
  const labels: string[] = []
  if (reward.expertise > 0) labels.push(`+${reward.expertise} ⚡`)
  if (reward.auraTech > 0) labels.push(`+${reward.auraTech} ✨`)
  if (reward.objectId) {
    labels.push(`📦 ${objectsById.get(reward.objectId)?.name ?? reward.objectId}`)
  }
  return labels
}

function MissionCard({
  progress,
  objectsById,
}: {
  progress: MissionProgress
  objectsById: Map<string, GameObject>
}) {
  const { mission, status, current, target } = progress
  const completed = status === 'completed'
  const shownCurrent = Math.min(current, target)
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const labels = rewardLabels(progress, objectsById)

  return (
    <article className={`snes-blockquote p-3 ${completed ? 'is-selected' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{OBJECTIVE_ICONS[mission.objective.type]}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white">{mission.name}</p>
            <span className={`text-[10px] ${completed ? 'text-nature' : 'text-gray-500'}`}>
              {completed ? 'Completada' : 'En curso'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">{mission.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-surface rounded overflow-hidden">
              <div
                className={`h-full ${completed ? 'bg-nature' : 'bg-tech'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{shownCurrent} / {target}</span>
          </div>
          <div
            className="h-2"
            role="progressbar"
            aria-label={`Progreso de ${mission.name}`}
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={shownCurrent}
          />
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {labels.map(label => (
                <span key={label} className="text-[10px] text-accent">{label}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export function MissionsPage() {
  const { user } = useAuth()
  const { metrics, refreshMetrics } = useMetrics()
  const { missions, inventory } = useRepositories()
  const [progress, setProgress] = useState<MissionProgress[]>([])
  const [definitions, setDefinitions] = useState<GameObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    void refreshMetrics().catch(() => {})
  }, [refreshMetrics])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(false)

    Promise.all([
      missions.list(user.id),
      inventory.listDefinitions(),
    ]).then(([availableMissions, availableObjects]) => {
      if (!active) return
      setProgress(availableMissions)
      setDefinitions(availableObjects)
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setError(true)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [user, missions, inventory, reload, metrics])

  if (!user) return null

  const objectsById = new Map(definitions.map(object => [object.id, object]))
  const activeMissions = progress.filter(entry => entry.status === 'active')
  const completedMissions = progress.filter(entry => entry.status === 'completed')

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Misiones</h1>
        <span className="text-gray-500 text-sm">
          {completedMissions.length}/{progress.length}
        </span>
      </header>

      <main className="flex-1 px-4 py-4">
        {loading && (
          <p className="text-gray-500 text-xs text-center py-8">Cargando misiones...</p>
        )}

        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-xs mb-3">No se pudieron cargar las misiones.</p>
            <button
              type="button"
              className="snes-button text-xs"
              onClick={() => setReload(value => value + 1)}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && progress.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-8">
            No hay misiones disponibles.
          </p>
        )}

        {!loading && !error && activeMissions.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold text-tech mb-3">En curso</h2>
            <div className="flex flex-col gap-3">
              {activeMissions.map(entry => (
                <MissionCard
                  key={entry.mission.id}
                  progress={entry}
                  objectsById={objectsById}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && completedMissions.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-nature mb-3">Completadas</h2>
            <div className="flex flex-col gap-3">
              {completedMissions.map(entry => (
                <MissionCard
                  key={entry.mission.id}
                  progress={entry}
                  objectsById={objectsById}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

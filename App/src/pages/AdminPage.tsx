import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { roleInfo } from '../auth/roles'
import { ARCHETYPES } from '../lib/constants'
import { Spinner } from '../components/Spinner'
import type { User, UserRole } from '../auth/types'
import type { Archetype } from '../monster/types'
import type { AdminDashboard } from '../lib/dashboard'

export const ADMIN_REFRESH_MS = 30_000

type RoleFilter = 'all' | UserRole
type ArchetypeFilter = 'all' | Archetype

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos los roles' },
  { value: 'participant', label: 'Participantes' },
  { value: 'admin', label: 'Administradores' },
]

function formatAverage(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-primary bg-surface px-4 py-3">
      <p className="text-[9px] text-gray-500">{icon} {label}</p>
      <p className="mt-2 text-xl font-bold text-tech md:text-2xl">{value}</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-4xl">📡</p>
      <p className="mb-2 font-bold text-white">No se pudo cargar el panel</p>
      <p className="mb-6 text-xs text-gray-500">Revisa tu conexión e intenta de nuevo.</p>
      <button onClick={onRetry} className="snes-button has-rose-color">
        Reintentar
      </button>
    </div>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const { users: usersRepository, dashboard: dashboardRepository } = useRepositories()

  const [users, setUsers] = useState<User[] | null>(null)
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [archetypeFilter, setArchetypeFilter] = useState<ArchetypeFilter>('all')

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load(showLoading: boolean) {
      if (showLoading) setLoading(true)

      try {
        const [nextUsers, nextDashboard] = await Promise.all([
          usersRepository.list(),
          dashboardRepository.getAdminOverview(),
        ])
        if (!active) return
        setUsers(nextUsers)
        setDashboard(nextDashboard)
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
    }, ADMIN_REFRESH_MS)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [usersRepository, dashboardRepository, reloadKey])

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase()

    return (users ?? [])
      .filter((candidate) => {
        if (roleFilter !== 'all' && candidate.role !== roleFilter) return false
        if (archetypeFilter !== 'all' && candidate.archetype !== archetypeFilter) return false
        if (!term) return true
        return (
          candidate.name.toLowerCase().includes(term)
          || candidate.email.toLowerCase().includes(term)
        )
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }, [users, query, roleFilter, archetypeFilter])

  async function toggleRole(candidate: User) {
    if (candidate.id === user?.id) return

    const nextRole: UserRole = candidate.role === 'admin' ? 'participant' : 'admin'
    setUpdatingId(candidate.id)
    setUpdateError(null)

    try {
      const updated = await usersRepository.updateRole(candidate.id, nextRole)
      setUsers(previous => (
        previous ? previous.map(item => (item.id === updated.id ? updated : item)) : previous
      ))
      setDashboard(await dashboardRepository.getAdminOverview())
    } catch {
      setUpdateError('No se pudo actualizar el rol. Inténtalo de nuevo.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && !users) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size={48} />
      </div>
    )
  }

  if (error && !users) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
        <ErrorState onRetry={() => setReloadKey(key => key + 1)} />
      </div>
    )
  }

  const adminCount = (users ?? []).filter(candidate => candidate.role === 'admin').length
  const participantCount = (users ?? []).length - adminCount

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white md:text-3xl">Panel de administración</h1>
          <p className="mt-2 text-[10px] text-gray-500 md:text-xs">
            {user?.name} · {roleInfo(user?.role ?? 'participant')?.name ?? 'Participante'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-secondary px-3 py-1 text-[9px] font-bold text-secondary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            EN VIVO · 30 s
          </span>
          <Link to="/my-monster" className="snes-link text-tech text-[10px]">
            Volver a Mi Criatura
          </Link>
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg border border-secondary/50 px-3 py-2 text-[9px] text-secondary">
          No se pudo actualizar. Mostrando los últimos datos disponibles.
        </p>
      )}

      <section aria-label="Estadísticas del evento" className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon="👾" label="Participantes" value={dashboard?.stats.totalUsers ?? 0} />
        <StatCard icon="⚔️" label="Combates" value={dashboard?.stats.totalBattles ?? 0} />
        <StatCard icon="🤝" label="Contactos" value={dashboard?.stats.totalContacts ?? 0} />
        <StatCard icon="🏆" label="Logros" value={dashboard?.stats.totalAchievements ?? 0} />
        <StatCard icon="⚡" label="Expertise medio" value={formatAverage(dashboard?.stats.averageExpertise ?? 0)} />
        <StatCard icon="✨" label="Aura media" value={formatAverage(dashboard?.stats.averageAuraTech ?? 0)} />
      </section>

      <section className="mb-6 grid gap-3 md:mb-8 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-[9px] text-gray-500">
          Buscar
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Nombre o email"
            className="snes-input w-full"
          />
        </label>
        <label className="flex flex-col gap-2 text-[9px] text-gray-500">
          Rol
          <select
            value={roleFilter}
            onChange={event => setRoleFilter(event.target.value as RoleFilter)}
            className="snes-input w-full"
          >
            {ROLE_FILTERS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-[9px] text-gray-500">
          Arquetipo
          <select
            value={archetypeFilter}
            onChange={event => setArchetypeFilter(event.target.value as ArchetypeFilter)}
            className="snes-input w-full"
          >
            <option value="all">Todos los arquetipos</option>
            {ARCHETYPES.map(archetype => (
              <option key={archetype.key} value={archetype.key}>{archetype.name}</option>
            ))}
          </select>
        </label>
      </section>

      <section aria-label="Usuarios" className="rounded-lg border border-primary bg-surface">
        <header className="flex flex-col gap-1 border-b border-primary px-4 py-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[11px] font-bold text-accent">👥 Usuarios registrados</h2>
          <p className="text-[9px] text-gray-500">
            {filteredUsers.length} de {users?.length ?? 0} · {adminCount} admin · {participantCount} participantes
          </p>
        </header>

        {updateError && (
          <p className="border-b border-primary px-4 py-2 text-[9px] text-secondary">{updateError}</p>
        )}

        {filteredUsers.length === 0 ? (
          <p className="px-4 py-8 text-center text-[9px] text-gray-500">
            No hay usuarios que coincidan con los filtros.
          </p>
        ) : (
          <ul className="divide-y divide-primary">
            {filteredUsers.map(candidate => {
              const archetype = ARCHETYPES.find(item => item.key === candidate.archetype)
              const isSelf = candidate.id === user?.id
              const isUpdating = updatingId === candidate.id

              return (
                <li
                  key={candidate.id}
                  className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center"
                >
                  <span className="text-lg">{archetype?.icon ?? '🐾'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-white">
                      {candidate.name}
                      {isSelf && <span className="ml-2 text-[8px] text-accent">Tú</span>}
                    </p>
                    <p className="truncate text-[8px] text-gray-500">
                      {candidate.email} · {archetype?.name ?? candidate.archetype}
                    </p>
                  </div>
                  <span
                    className={[
                      'w-fit rounded-full border px-2 py-1 text-[8px] font-bold',
                      candidate.role === 'admin'
                        ? 'border-secondary text-secondary'
                        : 'border-primary text-tech',
                    ].join(' ')}
                  >
                    {roleInfo(candidate.role)?.name ?? candidate.role}
                  </span>
                  <button
                    onClick={() => void toggleRole(candidate)}
                    disabled={isSelf || isUpdating}
                    className={[
                      'snes-button text-[8px]',
                      candidate.role === 'admin' ? 'has-phantom-color' : 'has-nature-color',
                      isSelf ? 'opacity-50' : '',
                    ].join(' ')}
                    title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
                  >
                    {isUpdating
                      ? 'Guardando...'
                      : candidate.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="mt-8 rounded-lg border border-primary bg-surface px-4 py-3 text-[9px] text-gray-500">
        Los cambios de rol se aplican al instante. La gestión de logros, objetos y QR llega en las
        siguientes stories.
      </p>
    </div>
  )
}

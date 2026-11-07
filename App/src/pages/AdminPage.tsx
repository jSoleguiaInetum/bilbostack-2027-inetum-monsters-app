import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { roleInfo } from '../auth/roles'

export function AdminPage() {
  const { user } = useAuth()
  if (!user) return null

  const role = roleInfo(user.role)

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white md:text-3xl">Panel de administración</h1>
          <p className="mt-2 text-[10px] text-gray-500 md:text-xs">
            {user.name} · {role?.name ?? user.role}
          </p>
        </div>
        <Link to="/my-monster" className="snes-link text-tech text-[10px]">
          Volver a Mi Criatura
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: '👥', title: 'Usuarios y roles', detail: 'Listado, filtros y asignación de roles.' },
          { icon: '🏆', title: 'Logros y objetos', detail: 'CRUD de logros, objetos e inventario.' },
          { icon: '📊', title: 'Estadísticas', detail: 'Métricas del evento en tiempo real.' },
        ].map(section => (
          <article key={section.title} className="rounded-lg border border-primary bg-surface p-4">
            <p className="mb-2 text-2xl">{section.icon}</p>
            <h2 className="text-[11px] font-bold text-accent">{section.title}</h2>
            <p className="mt-2 text-[9px] text-gray-500">{section.detail}</p>
            <p className="mt-3 text-[8px] text-gray-500">Disponible en la story 24.</p>
          </article>
        ))}
      </section>

      <p className="mt-8 rounded-lg border border-primary bg-surface px-4 py-3 text-[9px] text-gray-500">
        Acceso restringido al rol Administrador. Esta vista es el esqueleto del
        dashboard privado; el contenido de gestión llega en la siguiente story.
      </p>
    </div>
  )
}

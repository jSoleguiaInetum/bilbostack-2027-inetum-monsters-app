import { Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { QRDisplay } from '../qr/QRDisplay'
import { ARCHETYPES } from '../lib/constants'

export function MyQrPage() {
  const { user } = useAuth()

  if (!user) return null

  const archetypeInfo = ARCHETYPES.find(archetype => archetype.key === user.archetype)
  const payload = {
    type: 'person' as const,
    userId: user.id,
    name: user.name,
    email: user.email,
    archetype: user.archetype,
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Mi QR</h1>
        <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">
          Inicio
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center gap-5 px-6 py-8">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{user.name}</p>
          <p className="text-tech text-sm">{archetypeInfo?.icon} {archetypeInfo?.name}</p>
        </div>

        <div className="bg-white p-3 rounded-xl">
          <QRDisplay payload={payload} size={Math.min(300, window.innerWidth - 96)} />
        </div>

        <p className="text-gray-500 text-[10px] text-center max-w-xs">
          Mostrá este código para que otros asistentes sumen tu criatura a sus contactos.
        </p>
      </main>
    </div>
  )
}

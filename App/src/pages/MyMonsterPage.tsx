import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { isAdminRole } from '../auth/roles'
import { useMetrics } from '../lib/MetricsProvider'
import { useFeatureFlags } from '../lib/FeatureFlagsProvider'
import { MonsterCard } from '../monster/MonsterCard'
import { MonsterSkeleton } from '../components/MonsterSkeleton'
import { MetricsDisplay } from '../components/MetricsDisplay'
import { RarityBadge } from '../monster/RarityBadge'
import { QRDisplay } from '../qr/QRDisplay'
import { EvolutionProgress } from '../components/EvolutionProgress'
import { generateMonster } from '../monster/generator'
import { getEvolutionStage, EVOLUTION_THRESHOLDS } from '../lib/evolution'
import { ARCHETYPES } from '../lib/constants'
import type { MonsterParams } from '../monster/types'

export function MyMonsterPage() {
  const { user, signOut } = useAuth()
  const { metrics } = useMetrics()
  const { isEnabled } = useFeatureFlags()
  const navigate = useNavigate()
  const [params, setParams] = useState<MonsterParams | null>(null)
  const [qrFullscreen, setQrFullscreen] = useState(false)
  const [evolutionBanner, setEvolutionBanner] = useState<string | null>(null)

  const evolution = getEvolutionStage(metrics)
  const prevEvolution = useRef(evolution)

  useEffect(() => {
    if (evolution > prevEvolution.current) {
      const label = EVOLUTION_THRESHOLDS.find(t => t.stage === evolution)?.label ?? ''
      setEvolutionBanner(label)
      const timer = setTimeout(() => setEvolutionBanner(null), 4000)
      prevEvolution.current = evolution
      return () => clearTimeout(timer)
    }
    prevEvolution.current = evolution
  }, [evolution])

  useEffect(() => {
    if (user) {
      generateMonster(user.email).then(({ params }) => setParams(params))
    }
  }, [user])

  if (!user) return null

  const archetypeInfo = ARCHETYPES.find(a => a.key === user.archetype)

  const qrPayload = {
    type: 'person' as const,
    userId: user.id,
    name: user.name,
    email: user.email,
    archetype: user.archetype,
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold"
          style={{ background: 'linear-gradient(90deg, #E20074, #F5F340)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mi Criatura
        </h1>
        <div className="flex items-center gap-4">
          {isAdminRole(user.role) && (
            <Link to="/admin" className="text-tech hover:text-white text-sm transition-colors">
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut().then(() => navigate('/login'))}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center gap-6 px-6 py-8">
        {params ? (
          <MonsterCard params={params} archetype={user.archetype} evolution={evolution} size={Math.min(280, window.innerWidth - 80)} />
        ) : (
          <MonsterSkeleton size={Math.min(280, window.innerWidth - 80)} />
        )}

        {evolutionBanner && (
          <div className="animate-bounce snes-blockquote is-selected p-3 text-center">
            <p className="text-accent text-xs font-bold">✨ ¡EVOLUCIÓN!</p>
            <p className="text-white text-sm font-bold">{evolutionBanner}</p>
          </div>
        )}

        <div className="text-center flex flex-col items-center gap-3">
          <p className="text-xl font-bold text-white">{user.name}</p>
          <p className="text-tech text-sm">{archetypeInfo?.icon} {archetypeInfo?.name}</p>
          {params && <RarityBadge rarity={params.rarity} />}
          <MetricsDisplay metrics={metrics} />
          <EvolutionProgress metrics={metrics} />
          {isEnabled('inventory') && (
            <button
              onClick={() => navigate('/inventory')}
              className="snes-button has-ocean-color w-full max-w-xs"
            >
              Inventario
            </button>
          )}
          {isEnabled('missions') && (
            <button
              onClick={() => navigate('/missions')}
              className="snes-button has-turquoise-color w-full max-w-xs"
            >
              Misiones
            </button>
          )}
        </div>

      </main>

      <footer className="flex gap-4 px-6 py-6">
        <button
          onClick={() => setQrFullscreen(true)}
          className="snes-button has-ocean-color flex-1"
        >
          Mi QR
        </button>
        <button
          onClick={() => navigate('/scan')}
          className="snes-button has-rose-color flex-1"
        >
          Escanear
        </button>
      </footer>

      {qrFullscreen && params && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-4"
          onClick={() => setQrFullscreen(false)}
        >
          <QRDisplay payload={qrPayload} size={Math.min(window.innerWidth * 0.8, 400)} />
          <p className="text-gray-400 text-sm">Toca para cerrar</p>
        </div>
      )}
    </div>
  )
}

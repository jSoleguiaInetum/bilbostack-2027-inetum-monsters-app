import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { useMetrics } from '../lib/MetricsProvider'
import { MonsterCard } from '../monster/MonsterCard'
import { MonsterSkeleton } from '../components/MonsterSkeleton'
import { RarityBadge } from '../monster/RarityBadge'
import { generateMonster } from '../monster/generator'
import { useRepositories } from '../data/DataProvider'
import { ARCHETYPES } from '../lib/constants'
import type { User } from '../auth/types'
import type { MonsterParams, Archetype } from '../monster/types'
import type { QRPayload } from '../qr/types'

export function UserCardPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, getUserById } = useAuth()
  const { contacts } = useRepositories()

  const { addMetricsReward } = useMetrics()

  const rawPayload = (location.state as { payload?: QRPayload })?.payload
  const payloadFromState = rawPayload?.type === 'person' ? rawPayload : undefined

  const [userFromStore, setUserFromStore] = useState<User | null>(null)
  const [lookupDone, setLookupDone] = useState(false)
  const targetEmail = payloadFromState?.email ?? userFromStore?.email ?? null
  const targetName = payloadFromState?.name ?? userFromStore?.name ?? null
  const targetArchetype = (payloadFromState?.archetype ?? userFromStore?.archetype ?? 'developer') as Archetype
  const targetId = payloadFromState?.userId ?? id ?? null

  const [params, setParams] = useState<MonsterParams | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!id) {
      setUserFromStore(null)
      setLookupDone(true)
      return
    }

    let active = true
    setLookupDone(false)
    getUserById(id).then((found) => {
      if (!active) return
      setUserFromStore(found)
      setLookupDone(true)
    }).catch(() => {
      if (!active) return
      setUserFromStore(null)
      setLookupDone(true)
    })

    return () => {
      active = false
    }
  }, [id, getUserById])

  useEffect(() => {
    if (!targetEmail) return

    let active = true
    generateMonster(targetEmail).then(({ params }) => {
      if (active) setParams(params)
    })

    return () => {
      active = false
    }
  }, [targetEmail])

  useEffect(() => {
    if (!user || !targetId) {
      setConnected(false)
      return
    }

    let active = true
    contacts.isContact(user.id, targetId).then((value) => {
      if (active) setConnected(value)
    }).catch(() => {
      if (active) setConnected(false)
    })

    return () => {
      active = false
    }
  }, [user, targetId, contacts])

  if (!targetId || (!payloadFromState && lookupDone && !userFromStore)) {
    return (
      <div className="bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">🔍</p>
        <p className="text-white font-bold">Usuario no encontrado</p>
        <button onClick={() => navigate('/my-monster')} className="text-tech hover:text-white text-sm">
          ← Volver
        </button>
      </div>
    )
  }

  const archetypeInfo = ARCHETYPES.find(a => a.key === targetArchetype)

  async function handleConnect() {
    if (!user || !targetId || !targetName || !targetEmail) return
    const added = await contacts.add(user.id, {
      userId: targetId,
      name: targetName,
      email: targetEmail,
      archetype: targetArchetype,
    })
    if (added) {
      setConnected(true)
      await addMetricsReward('contact_add', targetArchetype)
    }
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Jugador encontrado</h1>
        <button
          onClick={() => navigate('/my-monster')}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← Volver
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
        {params ? (
          <MonsterCard params={params} archetype={targetArchetype} evolution={0} size={Math.min(240, window.innerWidth - 80)} />
        ) : (
          <MonsterSkeleton size={Math.min(240, window.innerWidth - 80)} />
        )}

        <div className="text-center flex flex-col items-center gap-2">
          <p className="text-xl font-bold text-white">{targetName}</p>
          <p className="text-tech text-sm">{archetypeInfo?.icon} {archetypeInfo?.name}</p>
          {params && <RarityBadge rarity={params.rarity} />}
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={handleConnect}
            disabled={connected}
            className={`snes-button flex-1 ${connected ? 'has-phantom-color' : 'has-nature-color'}`}
          >
            {connected ? '✓ Conectado' : 'Conectar'}
          </button>

          <button
            onClick={() => navigate(`/battle/${targetId}`, {
              state: { name: targetName, email: targetEmail, archetype: targetArchetype }
            })}
            className="snes-button has-rose-color flex-1"
          >
            ⚔️ Pelear
          </button>
        </div>
      </main>
    </div>
  )
}

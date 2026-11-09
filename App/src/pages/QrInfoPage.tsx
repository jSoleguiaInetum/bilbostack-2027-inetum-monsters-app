import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import type { QRPayload } from '../qr/types'

const TYPE_LABELS: Record<QRPayload['type'], string> = {
  person: 'Persona',
  talk: 'Charla',
  npc: 'NPC',
  mission: 'Misión',
  object: 'Objeto',
  event: 'Evento',
}

function payloadName(payload: QRPayload): string {
  switch (payload.type) {
    case 'person':
      return payload.name
    case 'talk':
      return payload.title
    case 'npc':
    case 'mission':
    case 'object':
    case 'event':
      return payload.name
  }
}

function payloadDescription(payload: QRPayload): string | undefined {
  switch (payload.type) {
    case 'talk':
      return payload.speaker
    case 'npc':
    case 'mission':
    case 'object':
    case 'event':
      return payload.description
    default:
      return undefined
  }
}

export function QrInfoPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { inventory: inventoryRepository } = useRepositories()
  const payload = (location.state as { payload?: QRPayload } | null)?.payload
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!payload || payload.type !== 'object' || !user) return
    let active = true

    inventoryRepository.add(user.id, {
      objectId: payload.objectId,
      source: 'qr',
    }).then(granted => {
      if (active) setMessage(granted ? '¡Objeto añadido a tu inventario!' : 'Ya tenías este objeto.')
    }).catch(() => {
      if (active) setMessage('No se pudo añadir el objeto.')
    })

    return () => {
      active = false
    }
  }, [payload, user, inventoryRepository])

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-4xl">🔳</p>
        <p className="font-bold text-white">QR no disponible</p>
        <Link to="/scan" className="snes-button has-nature-color text-[9px]">Volver al escáner</Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-primary px-6 py-4">
        <h1 className="text-lg font-bold text-white">{TYPE_LABELS[payload.type]}</h1>
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="text-sm text-gray-500 transition-colors hover:text-white"
        >
          Volver
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8 text-center">
        <p className="text-5xl">🔳</p>
        <div>
          <p className="text-[9px] uppercase text-tech">{TYPE_LABELS[payload.type]}</p>
          <h2 className="mt-2 text-xl font-bold text-white">{payloadName(payload)}</h2>
          {payloadDescription(payload) && (
            <p className="mt-3 max-w-sm text-xs text-gray-400">{payloadDescription(payload)}</p>
          )}
        </div>
        {message && (
          <p className="rounded-lg border border-secondary px-4 py-2 text-[10px] text-secondary">
            {message}
          </p>
        )}
        <Link to="/" className="snes-button has-nature-color text-[9px]">Ir al inicio</Link>
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { QRDisplay } from '../qr/QRDisplay'
import type { NewUserObject } from '../data/ports'
import type { Talk } from '../lib/seed-talks'

const INVENTORY_SAMPLES: NewUserObject[] = [
  { objectId: 'object-01', source: 'achievement' },
  { objectId: 'object-09', source: 'battle' },
  { objectId: 'object-16', source: 'qr' },
]

export function DevSeedPage() {
  const { user } = useAuth()
  const { talks, inventory } = useRepositories()
  const [items, setItems] = useState<Talk[]>([])
  const [seedMessage, setSeedMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    talks.list().then((availableTalks) => {
      if (active) setItems(availableTalks)
    }).catch(() => {
      if (active) setItems([])
    })

    return () => {
      active = false
    }
  }, [talks])

  async function seedInventory() {
    if (!user) return

    try {
      const results = await Promise.all(
        INVENTORY_SAMPLES.map(object => inventory.add(user.id, object)),
      )
      setSeedMessage(`${results.filter(Boolean).length} objetos agregados`)
    } catch {
      setSeedMessage('No se pudieron agregar los objetos')
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <h1 className="text-white font-bold text-lg mb-2 text-center">QR Charlas (Dev)</h1>
      <p className="text-gray-500 text-xs text-center mb-6">Escanea estos QR para hacer check-in de charlas</p>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {items.map(talk => (
          <div key={talk.talkId} className="snes-blockquote p-3 flex flex-col items-center gap-2">
            <QRDisplay payload={{ type: 'talk', ...talk }} size={110} />
            <p className="text-white text-[9px] font-bold text-center leading-tight">{talk.title}</p>
            <p className="text-tech text-[8px]">{talk.speaker}</p>
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto mt-10 text-center">
        <h2 className="text-white font-bold text-sm mb-2">Inventario (Dev)</h2>
        {user ? (
          <>
            <button onClick={seedInventory} className="snes-button has-ocean-color w-full">
              Otorgar objetos de prueba
            </button>
            {seedMessage && (
              <p className="text-tech text-[10px] mt-3">{seedMessage}</p>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-[10px]">Inicia sesión para otorgar objetos.</p>
        )}
      </div>
    </div>
  )
}

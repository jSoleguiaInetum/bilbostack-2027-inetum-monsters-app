import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { RarityBadge } from '../monster/RarityBadge'
import { RARITIES } from '../lib/constants'
import type { GameObject, ObjectSource, UserObject } from '../lib/objects'

const SOURCE_LABELS: Record<ObjectSource, string> = {
  achievement: 'Logro',
  qr: 'Código QR',
  battle: 'Combate',
  mission: 'Misión',
}

interface InventoryEntry {
  owned: UserObject
  definition: GameObject
}

export function InventoryPage() {
  const { user } = useAuth()
  const { inventory } = useRepositories()
  const [definitions, setDefinitions] = useState<GameObject[]>([])
  const [owned, setOwned] = useState<UserObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    setError(false)

    Promise.all([
      inventory.listDefinitions(),
      inventory.listOwned(user.id),
    ]).then(([availableObjects, userObjects]) => {
      if (!active) return
      setDefinitions(availableObjects)
      setOwned(userObjects)
      setLoading(false)
    }).catch(() => {
      if (!active) return
      setError(true)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [user, inventory, reload])

  if (!user) return null

  const definitionsById = new Map(definitions.map(object => [object.id, object]))
  const entries: InventoryEntry[] = owned
    .map(item => {
      const definition = definitionsById.get(item.objectId)
      return definition ? { owned: item, definition } : null
    })
    .filter((entry): entry is InventoryEntry => entry !== null)

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Inventario</h1>
        <span className="text-gray-500 text-sm">{entries.length} objetos</span>
      </header>

      <main className="flex-1 px-4 py-4">
        {loading && (
          <p className="text-gray-500 text-xs text-center py-8">Cargando inventario...</p>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-gray-400 text-xs text-center">No se pudo cargar el inventario.</p>
            <button
              onClick={() => setReload(value => value + 1)}
              className="snes-button has-ocean-color px-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="snes-blockquote p-6 text-center">
            <p className="text-2xl mb-3">🎒</p>
            <p className="text-gray-400 text-xs">Todavía no obtuviste objetos.</p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="flex flex-col gap-3">
            {entries.map(({ owned: item, definition }) => {
              const rarity = RARITIES.find(option => option.name === definition.rarity) ?? RARITIES[0]
              const obtainedAt = new Date(item.obtainedAt).toLocaleDateString('es-ES')

              return (
                <div
                  key={definition.id}
                  className="snes-blockquote is-selected p-3 flex items-center gap-3"
                >
                  <img
                    src={definition.iconUrl}
                    alt={definition.name}
                    className="w-12 h-12 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{definition.name}</p>
                    <p className="text-[10px] text-tech mb-2">{definition.benefit}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <RarityBadge rarity={rarity} />
                      <span className="text-[10px] text-gray-400">
                        {SOURCE_LABELS[item.source]}
                      </span>
                      <span className="text-[10px] text-gray-600">{obtainedAt}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

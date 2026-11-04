import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { getContacts } from '../lib/contacts'
import { generateMonster } from '../monster/generator'
import { MonsterCard } from '../monster/MonsterCard'
import { ARCHETYPES } from '../lib/constants'
import type { Archetype, MonsterParams } from '../monster/types'

interface ContactWithMonster {
  userId: string
  name: string
  email: string
  archetype: string
  connectedAt: string
  origin?: 'contact' | 'battle_win' | 'battle_loss' | 'battle_draw'
  params: MonsterParams | null
}

export function ContactsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<ContactWithMonster[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const raw = getContacts(user.id)
    Promise.all(
      raw.map(async (c) => {
        const { params } = await generateMonster(c.email)
        return { ...c, params, origin: (c as ContactWithMonster).origin ?? 'contact' as const }
      })
    ).then(withMonsters => {
      setContacts(withMonsters)
      setLoading(false)
    })
  }, [user])

  if (!user) return null

  const originIcon = (origin: string) => {
    switch (origin) {
      case 'battle_win': return '⚔️👑'
      case 'battle_loss': return '⚔️💀'
      case 'battle_draw': return '⚔️🤗'
      default: return '🤝'
    }
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Contactos</h1>
        <span className="text-gray-500 text-sm">{contacts.length}</span>
      </header>

      <main className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="border-4 border-surface border-t-secondary rounded-full animate-spin w-10 h-10" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-white font-bold mb-2">Sin contactos aún</p>
            <p className="text-gray-500 text-sm mb-6">Escanea el QR de otros jugadores para añadirlos</p>
            <button
              onClick={() => navigate('/scan')}
              className="snes-button has-rose-color"
            >
              Escanear QR
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contacts.map(contact => {
              const archInfo = ARCHETYPES.find(a => a.key === contact.archetype)
              return (
                <button
                  key={contact.userId}
                  onClick={() => navigate(`/user/${contact.userId}`)}
                  className="snes-blockquote p-3 flex items-center gap-3 cursor-pointer transition-all hover:border-secondary"
                >
                  <div className="w-12 h-12 flex-shrink-0">
                    {contact.params && (
                      <MonsterCard
                        params={contact.params}
                        archetype={contact.archetype as Archetype}
                        evolution={0}
                        size={48}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-white text-sm font-bold truncate">{contact.name}</p>
                    <p className="text-tech text-[10px]">{archInfo?.icon} {archInfo?.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg">{originIcon(contact.origin ?? 'contact')}</span>
                    <span className="text-gray-600 text-[9px]">
                      {new Date(contact.connectedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

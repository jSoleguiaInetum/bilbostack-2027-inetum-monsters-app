import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { useMetrics } from '../lib/MetricsProvider'
import { useRepositories } from '../data/DataProvider'
import type { TalkPayload } from '../qr/types'

export function TalkCheckInPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addMetricsReward } = useMetrics()
  const { checkins } = useRepositories()

  const talk = (location.state as { payload?: TalkPayload })?.payload
  const [checked, setChecked] = useState(false)
  const [justCheckedIn, setJustCheckedIn] = useState(false)

  useEffect(() => {
    if (!user || !talk) {
      setChecked(false)
      return
    }

    let active = true
    checkins.hasCheckedIn(user.id, talk.talkId).then((value) => {
      if (active) setChecked(value)
    }).catch(() => {
      if (active) setChecked(false)
    })

    return () => {
      active = false
    }
  }, [user, talk, checkins])

  if (!user || !talk) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-4xl">📋</p>
        <p className="text-white font-bold">Charla no encontrada</p>
        <button onClick={() => navigate('/my-monster')} className="text-tech hover:text-white text-sm">
          ← Volver
        </button>
      </div>
    )
  }

  async function handleCheckIn() {
    if (!user || !talk) return
    const added = await checkins.add(user.id, {
      talkId: talk.talkId,
      title: talk.title,
      speaker: talk.speaker,
    })
    if (added) {
      setChecked(true)
      setJustCheckedIn(true)
      await addMetricsReward('talk_checkin')
    } else {
      setChecked(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-4xl">🎤</p>
      <div className="text-center">
        <p className="text-white font-bold text-lg mb-2">{talk.title}</p>
        <p className="text-tech text-sm">{talk.speaker}</p>
      </div>

      {checked ? (
        <div className="text-center">
          <p className="text-nature font-bold text-sm">
            {justCheckedIn ? '¡Check-in registrado!' : 'Ya tienes check-in'}
          </p>
          {justCheckedIn && (
            <p className="text-energy text-xs mt-2">✨ +5 Aura Tech</p>
          )}
        </div>
      ) : (
        <button onClick={handleCheckIn} className="snes-button has-nature-color">
          Hacer check-in
        </button>
      )}

      <button
        onClick={() => navigate('/my-monster')}
        className="text-gray-500 hover:text-white text-sm transition-colors mt-4"
      >
        ← Volver
      </button>
    </div>
  )
}

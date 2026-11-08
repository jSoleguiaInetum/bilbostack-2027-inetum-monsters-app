import { useEffect, useState } from 'react'
import type { Mission } from '../lib/missions'

interface MissionToastProps {
  mission: Mission | null
  onDismiss: () => void
}

export function MissionToast({ mission, onDismiss }: MissionToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (mission) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [mission, onDismiss])

  if (!mission) return null

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="snes-blockquote is-selected px-4 py-3 flex items-center gap-3 min-w-[250px]">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-tech text-[10px] font-bold">MISIÓN COMPLETADA</p>
          <p className="text-white text-xs font-bold">{mission.name}</p>
        </div>
      </div>
    </div>
  )
}

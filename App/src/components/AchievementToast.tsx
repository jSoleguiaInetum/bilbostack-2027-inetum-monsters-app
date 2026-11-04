import { useEffect, useState } from 'react'
import { ACHIEVEMENT_DEFINITIONS, type UnlockedAchievement } from '../lib/achievements'

interface AchievementToastProps {
  achievement: UnlockedAchievement | null
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onDismiss])

  if (!achievement) return null

  const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === achievement.id)
  if (!def) return null

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="snes-blockquote is-selected px-4 py-3 flex items-center gap-3 min-w-[250px]">
        <span className="text-2xl">{def.icon}</span>
        <div>
          <p className="text-accent text-[10px] font-bold">LOGRO DESBLOQUEADO</p>
          <p className="text-white text-xs font-bold">{def.name}</p>
        </div>
      </div>
    </div>
  )
}

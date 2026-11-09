import { useEffect, useState } from 'react'
import { ACHIEVEMENT_DEFINITIONS, type Achievement, type UnlockedAchievement } from '../lib/achievements'
import { useRepositories } from '../data/DataProvider'

interface AchievementToastProps {
  achievement: UnlockedAchievement | null
  onDismiss: () => void
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const { achievements: achievementsRepository } = useRepositories()
  const [visible, setVisible] = useState(false)
  const [definition, setDefinition] = useState<Achievement | null>(null)

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

  useEffect(() => {
    if (!achievement) {
      setDefinition(null)
      return
    }

    let active = true
    const fallback = ACHIEVEMENT_DEFINITIONS.find(item => item.id === achievement.id) ?? null
    setDefinition(fallback)
    achievementsRepository.listDefinitions()
      .then(definitions => {
        if (!active) return
        setDefinition(definitions.find(item => item.id === achievement.id) ?? fallback)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [achievement, achievementsRepository])

  if (!achievement) return null

  const def = definition ?? {
    icon: '🏅',
    name: 'Nuevo logro',
  }

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

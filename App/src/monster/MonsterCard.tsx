import { useState, useEffect, useRef } from 'react'
import { getMonsterAssets } from './generator'
import type { MonsterParams, Archetype, Evolution } from './types'

interface MonsterCardProps {
  params: MonsterParams
  archetype: Archetype
  evolution?: Evolution
  size?: number
  className?: string
}

const LAYERS = ['aura', 'body', 'pattern', 'eyes', 'mouth', 'accessory', 'badge'] as const

export function MonsterCard({ params, archetype, evolution = 0, size = 256, className = '' }: MonsterCardProps) {
  const assets = getMonsterAssets(params, archetype, evolution)
  const [evolving, setEvolving] = useState(false)
  const prevEvolution = useRef(evolution)

  useEffect(() => {
    if (evolution > prevEvolution.current) {
      setEvolving(true)
      const timer = setTimeout(() => setEvolving(false), 1200)
      prevEvolution.current = evolution
      return () => clearTimeout(timer)
    }
    prevEvolution.current = evolution
  }, [evolution])

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {evolving && (
        <div
          className="absolute inset-0 z-10 rounded-full animate-ping"
          style={{
            background: 'radial-gradient(circle, rgba(245,243,64,0.6) 0%, rgba(226,0,116,0.3) 50%, transparent 70%)',
          }}
        />
      )}
      <div className={evolving ? 'animate-bounce' : ''}>
        {LAYERS.map((layer) => (
          <img
            key={layer}
            src={assets[layer]}
            alt={layer}
            className="absolute inset-0 w-full h-full"
            loading={layer === 'aura' ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  )
}

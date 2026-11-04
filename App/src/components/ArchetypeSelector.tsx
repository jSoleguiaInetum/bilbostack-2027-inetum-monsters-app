import { ARCHETYPES } from '../lib/constants'
import type { Archetype } from '../monster/types'

interface ArchetypeSelectorProps {
  selected: Archetype | null
  onSelect: (archetype: Archetype) => void
}

export function ArchetypeSelector({ selected, onSelect }: ArchetypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ARCHETYPES.map((arch) => (
        <button
          key={arch.key}
          type="button"
          onClick={() => onSelect(arch.key as Archetype)}
          className={`snes-blockquote p-3 text-left cursor-pointer transition-all ${selected === arch.key ? 'is-selected' : ''}`}
        >
          <div className="text-2xl mb-1">{arch.icon}</div>
          <div className="text-sm font-bold text-white">{arch.name}</div>
          <div className="text-xs text-tech mt-1">{arch.description}</div>
        </button>
      ))}
    </div>
  )
}

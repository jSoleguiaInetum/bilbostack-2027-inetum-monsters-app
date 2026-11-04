import type { Rarity } from './types'

interface RarityBadgeProps {
  rarity: Rarity
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: rarity.bgColor, color: rarity.color }}
    >
      {rarity.name}
    </span>
  )
}

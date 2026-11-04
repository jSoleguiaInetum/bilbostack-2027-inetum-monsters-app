import type { PlayerMetrics } from '../lib/metrics'

interface MetricsDisplayProps {
  metrics: PlayerMetrics
  compact?: boolean
}

export function MetricsDisplay({ metrics, compact }: MetricsDisplayProps) {
  if (compact) {
    return (
      <div className="flex gap-4 text-xs">
        <span className="text-accent">⚡ {metrics.expertise}</span>
        <span className="text-energy">✨ {metrics.auraTech}</span>
      </div>
    )
  }

  return (
    <div className="flex gap-6 justify-center">
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl">⚡</span>
        <span className="text-accent font-bold text-sm">{metrics.expertise}</span>
        <span className="text-gray-500 text-[10px]">Expertise</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl">✨</span>
        <span className="text-energy font-bold text-sm">{metrics.auraTech}</span>
        <span className="text-gray-500 text-[10px]">Aura Tech</span>
      </div>
    </div>
  )
}

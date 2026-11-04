import { getEvolutionStage, getNextEvolution, EVOLUTION_THRESHOLDS } from '../lib/evolution'
import type { PlayerMetrics } from '../lib/metrics'

export function EvolutionProgress({ metrics }: { metrics: PlayerMetrics }) {
  const current = getEvolutionStage(metrics)
  const next = getNextEvolution(metrics)
  const currentLabel = EVOLUTION_THRESHOLDS.find(t => t.stage === current)!.label

  if (!next) {
    return (
      <div className="w-full max-w-xs text-center">
        <p className="text-nature text-xs font-bold">🏆 {currentLabel}</p>
        <p className="text-gray-500 text-[10px] mt-1">Evolución máxima alcanzada</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-gray-400">{currentLabel}</span>
        <span className="text-energy">{next.threshold.label}</span>
      </div>
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-primary">
        <div
          className="h-full bg-gradient-to-r from-secondary to-accent rounded-full transition-all duration-500"
          style={{ width: `${Math.round(next.progress * 100)}%` }}
        />
      </div>
      <p className="text-gray-500 text-[10px] mt-1 text-center">
        {metrics.expertise + metrics.auraTech} / {next.threshold.totalRequired}
      </p>
    </div>
  )
}

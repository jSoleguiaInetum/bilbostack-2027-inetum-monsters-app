import type { PlayerMetrics } from './metrics'
import type { Evolution } from '../monster/types'

export interface EvolutionThreshold {
  stage: Evolution
  totalRequired: number
  label: string
}

export const EVOLUTION_THRESHOLDS: EvolutionThreshold[] = [
  { stage: 0, totalRequired: 0,   label: 'Base' },
  { stage: 1, totalRequired: 20,  label: 'Evolución I' },
  { stage: 2, totalRequired: 60,  label: 'Evolución II' },
  { stage: 3, totalRequired: 120, label: 'Evolución III' },
]

export function getEvolutionStage(metrics: PlayerMetrics): Evolution {
  const total = metrics.expertise + metrics.auraTech
  let stage: Evolution = 0
  for (const threshold of EVOLUTION_THRESHOLDS) {
    if (total >= threshold.totalRequired) {
      stage = threshold.stage
    }
  }
  return stage
}

export function getNextEvolution(metrics: PlayerMetrics): { threshold: EvolutionThreshold; progress: number } | null {
  const total = metrics.expertise + metrics.auraTech
  const current = getEvolutionStage(metrics)
  const next = EVOLUTION_THRESHOLDS.find(t => t.stage === (current + 1) as Evolution)
  if (!next) return null
  const prev = EVOLUTION_THRESHOLDS.find(t => t.stage === current)!
  const range = next.totalRequired - prev.totalRequired
  const progress = Math.min(1, (total - prev.totalRequired) / range)
  return { threshold: next, progress }
}

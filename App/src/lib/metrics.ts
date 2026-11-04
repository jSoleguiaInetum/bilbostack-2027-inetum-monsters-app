import type { Archetype } from '../monster/types'

export interface MetricsEntry {
  action: ActionType
  expertise: number
  auraTech: number
  timestamp: string
}

export interface PlayerMetrics {
  expertise: number
  auraTech: number
  history: MetricsEntry[]
}

export type ActionType =
  | 'register'
  | 'contact_add'
  | 'contact_diverse'
  | 'battle_win'
  | 'battle_loss'
  | 'battle_draw'
  | 'talk_checkin'
  | 'achievement'
  | 'question_correct'
  | 'question_wrong'

export const REWARDS: Record<ActionType, { expertise: number; auraTech: number }> = {
  register:          { expertise: 1, auraTech: 1 },
  contact_add:       { expertise: 0, auraTech: 2 },
  contact_diverse:   { expertise: 0, auraTech: 3 },
  battle_win:        { expertise: 5, auraTech: 3 },
  battle_loss:       { expertise: 2, auraTech: 1 },
  battle_draw:       { expertise: 3, auraTech: 2 },
  talk_checkin:      { expertise: 0, auraTech: 5 },
  achievement:       { expertise: 0, auraTech: 2 },
  question_correct:  { expertise: 3, auraTech: 0 },
  question_wrong:    { expertise: 1, auraTech: 0 },
}

const RARITY_AURA_BONUS: Record<string, number> = {
  Inusual:     0,
  Singular:    1,
  'Único':     2,
  'Épico':     4,
  Legendario:  8,
}

const METRICS_KEY = 'bilbostack_metrics'

function storageKey(userId: string): string {
  return `${METRICS_KEY}_${userId}`
}

export function getMetrics(userId: string): PlayerMetrics {
  const data = localStorage.getItem(storageKey(userId))
  if (data) return JSON.parse(data)
  return { expertise: 0, auraTech: 0, history: [] }
}

function saveMetrics(userId: string, metrics: PlayerMetrics): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(metrics))
}

export function initializeMetrics(userId: string, rarityName: string): PlayerMetrics {
  const existing = getMetrics(userId)
  if (existing.history.length > 0) return existing

  const auraBonus = RARITY_AURA_BONUS[rarityName] ?? 0
  const metrics: PlayerMetrics = {
    expertise: 1,
    auraTech: 1 + auraBonus,
    history: [{
      action: 'register',
      expertise: 1,
      auraTech: 1 + auraBonus,
      timestamp: new Date().toISOString(),
    }],
  }
  saveMetrics(userId, metrics)
  return metrics
}

export function addReward(
  userId: string,
  action: ActionType,
  contactArchetype?: Archetype,
  userArchetype?: Archetype,
): PlayerMetrics {
  const metrics = getMetrics(userId)
  let reward = { ...REWARDS[action] }

  if (action === 'contact_add' && contactArchetype && userArchetype && contactArchetype !== userArchetype) {
    const diverseReward = REWARDS.contact_diverse
    reward = { expertise: reward.expertise + diverseReward.expertise, auraTech: reward.auraTech + diverseReward.auraTech }
  }

  metrics.expertise += reward.expertise
  metrics.auraTech += reward.auraTech
  metrics.history.push({
    action,
    expertise: reward.expertise,
    auraTech: reward.auraTech,
    timestamp: new Date().toISOString(),
  })

  saveMetrics(userId, metrics)
  return metrics
}

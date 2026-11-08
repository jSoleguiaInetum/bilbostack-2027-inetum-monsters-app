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
  | 'mission_complete'

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
  mission_complete:  { expertise: 0, auraTech: 0 },
}

const RARITY_AURA_BONUS: Record<string, number> = {
  Inusual:     0,
  Singular:    1,
  'Único':     2,
  'Épico':     4,
  Legendario:  8,
}

export function emptyMetrics(): PlayerMetrics {
  return { expertise: 0, auraTech: 0, history: [] }
}

export function createInitialMetrics(rarityName: string): PlayerMetrics {
  const auraBonus = RARITY_AURA_BONUS[rarityName] ?? 0
  return {
    expertise: 1,
    auraTech: 1 + auraBonus,
    history: [{
      action: 'register',
      expertise: 1,
      auraTech: 1 + auraBonus,
      timestamp: new Date().toISOString(),
    }],
  }
}

export function applyReward(
  metrics: PlayerMetrics,
  action: ActionType,
  contactArchetype?: Archetype,
  userArchetype?: Archetype,
): PlayerMetrics {
  let reward = { ...REWARDS[action] }

  if (action === 'contact_add' && contactArchetype && userArchetype && contactArchetype !== userArchetype) {
    const diverseReward = REWARDS.contact_diverse
    reward = {
      expertise: reward.expertise + diverseReward.expertise,
      auraTech: reward.auraTech + diverseReward.auraTech,
    }
  }

  return {
    expertise: metrics.expertise + reward.expertise,
    auraTech: metrics.auraTech + reward.auraTech,
    history: [
      ...metrics.history,
      {
        action,
        expertise: reward.expertise,
        auraTech: reward.auraTech,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

import type { Archetype } from '../monster/types'

export type ContactOrigin = 'contact' | 'battle_win' | 'battle_loss' | 'battle_draw'

export interface Contact {
  userId: string
  name: string
  email: string
  archetype: Archetype
  connectedAt: string
  origin?: ContactOrigin
}

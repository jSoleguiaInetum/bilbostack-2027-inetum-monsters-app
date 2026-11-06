import type { CheckIn } from '../types'

export type NewCheckIn = Omit<CheckIn, 'checkedInAt'>

export interface CheckInsRepository {
  list(userId: string): Promise<CheckIn[]>
  hasCheckedIn(userId: string, talkId: string): Promise<boolean>
  add(userId: string, checkIn: NewCheckIn): Promise<boolean>
}

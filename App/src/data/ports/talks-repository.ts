import type { Talk } from '../types'

export interface TalksRepository {
  list(): Promise<Talk[]>
}

import { SEED_TALKS } from '../../lib/seed-talks'
import type { Talk } from '../types'
import type { TalksRepository } from '../ports/talks-repository'

async function list(): Promise<Talk[]> {
  return [...SEED_TALKS]
}

export const localTalksRepository: TalksRepository = {
  list,
}

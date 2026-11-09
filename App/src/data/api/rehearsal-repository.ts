import type {
  RehearsalFeedback,
  RehearsalFeedbackInput,
  RehearsalRepository,
  RehearsalSeedOptions,
  RehearsalSeedResult,
} from '../ports/rehearsal-repository'
import { DataError } from '../errors'

/**
 * La siembra de ensayo no tiene equivalente en un backend real: no se pueden
 * inventar otros usuarios en un servidor compartido. En modo `api` la
 * capacidad simplemente no existe.
 */
function unavailable(): never {
  throw new DataError(
    'NOT_IMPLEMENTED',
    'El modo de ensayo solo esta disponible en modo local (VITE_DATA_MODE=local)',
  )
}

export const apiRehearsalRepository: RehearsalRepository = {
  seed: async (_userId: string | null, _options?: Partial<RehearsalSeedOptions>): Promise<RehearsalSeedResult> =>
    unavailable(),
  reset: async (): Promise<void> => unavailable(),
  saveFeedback: async (_input: RehearsalFeedbackInput): Promise<RehearsalFeedback> => unavailable(),
  listFeedback: async (): Promise<RehearsalFeedback[]> => unavailable(),
}

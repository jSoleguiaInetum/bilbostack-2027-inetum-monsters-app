/**
 * Puerto de utileria para el dress rehearsal (Fase 4).
 *
 * Es una capacidad de desarrollo, no de dominio: siembra datos ficticios para
 * que el ensayo se vea con volumen realista y captura el feedback de los
 * asistentes. Solo tiene sentido en modo `local`; en modo `api` la
 * implementacion falla con `NOT_IMPLEMENTED`.
 */

export interface RehearsalSeedOptions {
  /** Cantidad de usuarios ficticios para poblar rankings y dashboard. */
  userCount: number
  /** Maximo de contactos por usuario ficticio. */
  contactsPerUser: number
}

export const DEFAULT_REHEARSAL_SEED_OPTIONS: RehearsalSeedOptions = {
  userCount: 24,
  contactsPerUser: 6,
}

export interface RehearsalSeedResult {
  users: number
  contacts: number
  achievements: number
  objects: number
  /** `true` cuando el usuario actual recibio datos de ensayo. */
  enrichedCurrentUser: boolean
}

export interface RehearsalFeedbackInput {
  /** Puntuacion de 1 a 5 sobre la experiencia general. */
  rating: number
  /** Flujo probado (registro, qr, combate, logros, etc.). */
  flow: string
  /** Dispositivo usado en el ensayo. */
  device: string
  /** Comentario libre del asistente. */
  comment: string
  /** Marca un fallo que impide seguir usando la app. */
  blocking: boolean
}

export interface RehearsalFeedback extends RehearsalFeedbackInput {
  id: string
  createdAt: string
}

export interface RehearsalRepository {
  /** Siembra usuarios ficticios y enriquecen al usuario actual. */
  seed(userId: string | null, options?: Partial<RehearsalSeedOptions>): Promise<RehearsalSeedResult>
  /** Elimina los datos de ensayo sin tocar los datos reales del usuario. */
  reset(): Promise<void>
  saveFeedback(input: RehearsalFeedbackInput): Promise<RehearsalFeedback>
  listFeedback(): Promise<RehearsalFeedback[]>
}

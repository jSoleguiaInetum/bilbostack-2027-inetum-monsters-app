export type DataErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_IMPLEMENTED'
  | 'NETWORK'
  | 'UNKNOWN'

export class DataError extends Error {
  code: DataErrorCode

  constructor(code: DataErrorCode, message: string) {
    super(message)
    this.name = 'DataError'
    this.code = code
  }
}

export function toDataError(error: unknown): DataError {
  if (error instanceof DataError) return error
  if (error instanceof Error) return new DataError('UNKNOWN', error.message)
  return new DataError('UNKNOWN', 'Error de datos desconocido')
}

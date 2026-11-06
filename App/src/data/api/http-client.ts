import { API_BASE_URL } from '../config'
import { DataError, type DataErrorCode } from '../errors'

export interface RequestOptions {
  method?: string
  body?: unknown
  signal?: AbortSignal
}

const STATUS_CODES: Record<number, DataErrorCode> = {
  400: 'VALIDATION',
  401: 'UNAUTHORIZED',
  403: 'UNAUTHORIZED',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION',
}

async function toHttpError(response: Response): Promise<DataError> {
  let message = response.statusText || `Error HTTP ${response.status}`
  try {
    const payload = await response.json() as { message?: string }
    if (typeof payload.message === 'string') message = payload.message
  } catch {
    // La respuesta de error no era JSON.
  }
  return new DataError(STATUS_CODES[response.status] ?? 'UNKNOWN', message)
}

export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    let response: Response

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        credentials: 'include',
        headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      })
    } catch (error) {
      throw new DataError('NETWORK', error instanceof Error ? error.message : 'Error de red')
    }

    if (!response.ok) {
      throw await toHttpError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const body = await response.text()
    if (!body) return undefined as T

    try {
      return JSON.parse(body) as T
    } catch {
      throw new DataError('UNKNOWN', 'Respuesta JSON inválida')
    }
  }
}

export const httpClient = new HttpClient()

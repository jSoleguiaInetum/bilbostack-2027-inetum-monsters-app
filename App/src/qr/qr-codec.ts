import type { QRPayload } from './types'

export function encodeQRPayload(payload: QRPayload): string {
  return btoa(JSON.stringify(payload))
}

export function decodeQRPayload(data: string): QRPayload | null {
  try {
    const decoded = JSON.parse(atob(data))
    if (decoded.type === 'person' && decoded.userId && decoded.name) {
      return decoded as QRPayload
    }
    if (decoded.type === 'talk' && decoded.talkId && decoded.title) {
      return decoded as QRPayload
    }
    return null
  } catch {
    return null
  }
}

import type { QRPayload } from './types'

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodeBase64(value: string): string {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeQRPayload(payload: QRPayload): string {
  return encodeBase64(JSON.stringify(payload))
}

export function decodeQRPayload(data: string): QRPayload | null {
  try {
    const decoded = JSON.parse(decodeBase64(data))
    if (decoded.type === 'person' && decoded.userId && decoded.name) {
      return decoded as QRPayload
    }
    if (decoded.type === 'talk' && decoded.talkId && decoded.title) {
      return decoded as QRPayload
    }
    if (decoded.type === 'npc' && decoded.npcId && decoded.name) {
      return decoded as QRPayload
    }
    if (decoded.type === 'mission' && decoded.missionId && decoded.name) {
      return decoded as QRPayload
    }
    if (decoded.type === 'object' && decoded.objectId && decoded.name) {
      return decoded as QRPayload
    }
    if (decoded.type === 'event' && decoded.eventId && decoded.name) {
      return decoded as QRPayload
    }
    return null
  } catch {
    return null
  }
}

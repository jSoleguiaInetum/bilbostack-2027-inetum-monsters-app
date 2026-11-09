export interface PersonPayload {
  type: 'person'
  userId: string
  name: string
  email: string
  archetype: string
}

export interface TalkPayload {
  type: 'talk'
  talkId: string
  title: string
  speaker: string
}

export interface NpcPayload {
  type: 'npc'
  npcId: string
  name: string
  description?: string
}

export interface MissionPayload {
  type: 'mission'
  missionId: string
  name: string
  description?: string
}

export interface ObjectPayload {
  type: 'object'
  objectId: string
  name: string
  description?: string
}

export interface EventPayload {
  type: 'event'
  eventId: string
  name: string
  description?: string
}

export type QRPayload =
  | PersonPayload
  | TalkPayload
  | NpcPayload
  | MissionPayload
  | ObjectPayload
  | EventPayload

export type AdminQrType = 'talk' | 'npc' | 'mission' | 'object' | 'event'

export interface AdminQr {
  id: string
  type: AdminQrType
  label: string
  payload: QRPayload
  createdAt: string
}

export interface AdminQrInput {
  type: AdminQrType
  label: string
  referenceId: string
  description?: string
  speaker?: string
}

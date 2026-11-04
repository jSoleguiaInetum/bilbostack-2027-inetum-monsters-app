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

export type QRPayload = PersonPayload | TalkPayload

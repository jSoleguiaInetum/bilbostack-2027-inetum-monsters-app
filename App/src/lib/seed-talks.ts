import talksData from '../data/talks.json'

export interface TalkSpeaker {
  name: string
  url: string
}

export interface Talk {
  talkId: string
  title: string
  speaker: string
  speakers?: TalkSpeaker[]
  description?: string
}

export const SEED_TALKS: Talk[] = talksData.map((talk) => ({
  talkId: talk.talkId,
  title: talk.title,
  speaker: talk.speakers.map((speaker) => speaker.name).join(' y '),
  speakers: talk.speakers,
  description: talk.description,
}))

import type { TalksRepository } from '../ports'
import { toTalk, type TalkDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiTalksRepository(client: HttpClient): TalksRepository {
  async function list() {
    const dtos = await client.request<TalkDto[]>('/talks')
    return dtos.map(toTalk)
  }

  return { list }
}

import type { BattlesRepository } from '../ports'
import { toBattle, type BattleDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiBattlesRepository(client: HttpClient): BattlesRepository {
  async function list(userId: string) {
    const dtos = await client.request<BattleDto[]>(
      `/users/${encodeURIComponent(userId)}/battles`,
    )
    return dtos.map(toBattle)
  }

  async function save(userId: string, battle: Parameters<BattlesRepository['save']>[1]) {
    await client.request<void>(`/users/${encodeURIComponent(userId)}/battles`, {
      method: 'POST',
      body: battle,
    })
  }

  async function getFoughtOpponents(userId: string) {
    const battles = await list(userId)
    return [...new Set(battles.map(battle => battle.opponentId))]
  }

  async function hasFought(userId: string, opponentId: string) {
    return (await getFoughtOpponents(userId)).includes(opponentId)
  }

  return { list, save, hasFought, getFoughtOpponents }
}

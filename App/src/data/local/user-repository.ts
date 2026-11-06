import type { User } from '../../auth/types'
import type { UserRepository } from '../ports/user-repository'
import { readJson, STORAGE_KEYS } from './storage'

async function getUserById(id: string): Promise<User | null> {
  const users = readJson<User[]>(STORAGE_KEYS.users, [])
  return users.find((user) => user.id === id) ?? null
}

async function list(): Promise<User[]> {
  return readJson<User[]>(STORAGE_KEYS.users, [])
}

export const localUserRepository: UserRepository = {
  getUserById,
  list,
}

import type { User, UserRole } from '../../auth/types'
import type { UserRepository } from '../ports/user-repository'
import { DataError } from '../errors'
import { readJson, STORAGE_KEYS, writeJson } from './storage'

async function getUserById(id: string): Promise<User | null> {
  const users = readJson<User[]>(STORAGE_KEYS.users, [])
  return users.find((user) => user.id === id) ?? null
}

async function list(): Promise<User[]> {
  return readJson<User[]>(STORAGE_KEYS.users, [])
}

function updateSession(user: User): void {
  const raw = localStorage.getItem(STORAGE_KEYS.session)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw) as User | string
    if (typeof parsed !== 'string' && parsed.id === user.id) {
      writeJson(STORAGE_KEYS.session, user)
    }
  } catch {
    // La sesión no era JSON válido; se ignora.
  }
}

async function updateRole(id: string, role: UserRole): Promise<User> {
  const users = await list()
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) {
    throw new DataError('NOT_FOUND', 'Usuario no encontrado')
  }

  const updated = { ...users[index], role }
  const next = [...users]
  next[index] = updated
  writeJson(STORAGE_KEYS.users, next)
  updateSession(updated)

  return updated
}

export const localUserRepository: UserRepository = {
  getUserById,
  list,
  updateRole,
}

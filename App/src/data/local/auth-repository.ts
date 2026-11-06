import type { User } from '../../auth/types'
import type { Archetype } from '../../monster/types'
import type { AuthRepository, OAuthProvider } from '../ports/auth-repository'
import { readJson, removeKey, STORAGE_KEYS, writeJson } from './storage'

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readUsers(): User[] {
  return readJson<User[]>(STORAGE_KEYS.users, [])
}

function saveUsers(users: User[]): void {
  writeJson(STORAGE_KEYS.users, users)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function readSession(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.session)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as User | string
    if (typeof parsed === 'string') {
      return readUsers().find((user) => user.id === parsed) ?? null
    }
    return parsed
  } catch {
    return null
  }
}

async function signUpWithEmail(
  email: string,
  _password: string,
  name: string,
  archetype: Archetype,
): Promise<User> {
  await delay()
  const users = readUsers()
  const normalized = normalizeEmail(email)

  if (users.some((user) => user.email === normalized)) {
    throw new Error('Email ya registrado')
  }

  const user: User = {
    id: crypto.randomUUID(),
    email: normalized,
    name,
    archetype,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])
  writeJson(STORAGE_KEYS.session, user)
  return user
}

async function signInWithEmail(email: string, _password: string): Promise<User> {
  await delay()
  const user = readUsers().find((candidate) => candidate.email === normalizeEmail(email))

  if (!user) throw new Error('Usuario no encontrado')

  writeJson(STORAGE_KEYS.session, user)
  return user
}

async function signInWithOAuth(provider: OAuthProvider): Promise<User> {
  await delay()
  const user: User = {
    id: crypto.randomUUID(),
    email: `oauth-${provider}-${Date.now()}@mock.bilbostack.dev`,
    name: `Usuario ${provider}`,
    archetype: 'multiclass',
    createdAt: new Date().toISOString(),
  }
  saveUsers([...readUsers(), user])
  writeJson(STORAGE_KEYS.session, user)
  return user
}

async function signOut(): Promise<void> {
  await delay(100)
  removeKey(STORAGE_KEYS.session)
}

async function getSession(): Promise<User | null> {
  return readSession()
}

async function getUserById(id: string): Promise<User | null> {
  return readUsers().find((user) => user.id === id) ?? null
}

export const localAuthRepository: AuthRepository = {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  getSession,
  getUserById,
}

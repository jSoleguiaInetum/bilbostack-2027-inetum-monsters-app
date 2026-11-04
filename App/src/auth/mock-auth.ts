import type { AuthAdapter, OAuthProvider } from './auth-interface'
import type { User } from './types'
import type { Archetype } from '../monster/types'

const USERS_KEY = 'bilbostack_users'
const SESSION_KEY = 'bilbostack_session'

function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockAuth: AuthAdapter = {
  async signUpWithEmail(email, _password, name, archetype: Archetype) {
    await delay()
    const users = getUsers()
    const normalized = email.trim().toLowerCase()
    if (users.find(u => u.email === normalized)) {
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signInWithEmail(email, _password) {
    await delay()
    const users = getUsers()
    const user = users.find(u => u.email === email.trim().toLowerCase())
    if (!user) throw new Error('Usuario no encontrado')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signInWithOAuth(provider: OAuthProvider) {
    await delay()
    const fakeEmail = `oauth-${provider}-${Date.now()}@mock.bilbostack.dev`
    const user: User = {
      id: crypto.randomUUID(),
      email: fakeEmail,
      name: `Usuario ${provider}`,
      archetype: 'multiclass',
      createdAt: new Date().toISOString(),
    }
    const users = getUsers()
    saveUsers([...users, user])
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signOut() {
    await delay(100)
    localStorage.removeItem(SESSION_KEY)
  },

  getSession() {
    const data = localStorage.getItem(SESSION_KEY)
    return data ? JSON.parse(data) : null
  },

  getUserById(id: string) {
    const users = getUsers()
    return users.find(u => u.id === id) ?? null
  },
}

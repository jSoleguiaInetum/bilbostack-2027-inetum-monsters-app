import type { Archetype } from '../monster/types'

export interface User {
  id: string
  email: string
  name: string
  archetype: Archetype
  createdAt: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, archetype: Archetype) => Promise<void>
  signOut: () => Promise<void>
}

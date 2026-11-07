import type { Archetype } from '../monster/types'

export type UserRole = 'participant' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  archetype: Archetype
  role: UserRole
  createdAt: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, archetype: Archetype) => Promise<void>
  signOut: () => Promise<void>
}

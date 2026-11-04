import type { User } from './types'
import type { Archetype } from '../monster/types'

export type OAuthProvider = 'google' | 'linkedin' | string

export interface AuthAdapter {
  signUpWithEmail(email: string, password: string, name: string, archetype: Archetype): Promise<User>
  signInWithEmail(email: string, password: string): Promise<User>
  signInWithOAuth(provider: OAuthProvider): Promise<User>
  signOut(): Promise<void>
  getSession(): User | null
  getUserById(id: string): User | null
}

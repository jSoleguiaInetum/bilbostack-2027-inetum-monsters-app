import type { User } from '../../auth/types'
import type { Archetype } from '../../monster/types'

export type OAuthProvider = 'google' | 'linkedin' | string

export interface AuthRepository {
  signUpWithEmail(email: string, password: string, name: string, archetype: Archetype): Promise<User>
  signInWithEmail(email: string, password: string): Promise<User>
  signInWithOAuth(provider: OAuthProvider): Promise<User>
  signOut(): Promise<void>
  getSession(): Promise<User | null>
  getUserById(id: string): Promise<User | null>
}

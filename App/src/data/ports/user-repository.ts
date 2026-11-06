import type { User } from '../../auth/types'

export interface UserRepository {
  getUserById(id: string): Promise<User | null>
  list(): Promise<User[]>
}

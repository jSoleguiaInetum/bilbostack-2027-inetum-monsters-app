import type { User, UserRole } from '../../auth/types'

export interface UserRepository {
  getUserById(id: string): Promise<User | null>
  list(): Promise<User[]>
  updateRole(id: string, role: UserRole): Promise<User>
}

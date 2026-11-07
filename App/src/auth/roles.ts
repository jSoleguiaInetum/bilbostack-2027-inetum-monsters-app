import type { UserRole } from './types'

export interface RoleInfo {
  key: UserRole
  name: string
  description: string
}

export const USER_ROLES: RoleInfo[] = [
  { key: 'participant', name: 'Participante', description: 'Asistente del evento' },
  { key: 'admin', name: 'Administrador', description: 'Acceso completo al panel de administración' },
]

const ADMIN_ROLES: UserRole[] = ['admin']

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role !== undefined && role !== null && ADMIN_ROLES.includes(role)
}

export function isKnownRole(role: string): role is UserRole {
  return USER_ROLES.some(info => info.key === role)
}

export function roleInfo(role: UserRole): RoleInfo | undefined {
  return USER_ROLES.find(info => info.key === role)
}

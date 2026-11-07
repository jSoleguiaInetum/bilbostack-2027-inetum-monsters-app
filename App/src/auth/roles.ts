import type { UserRole } from './types'

export interface RoleInfo {
  key: UserRole
  name: string
  description: string
}

export const USER_ROLES: RoleInfo[] = [
  { key: 'participant', name: 'Participante', description: 'Asistente del evento' },
  { key: 'organization', name: 'Organización', description: 'Equipo organizador de BilboStack' },
  { key: 'speaker', name: 'Ponente', description: 'Ponente de una charla del evento' },
  { key: 'ex-speaker', name: 'Ex-Ponente', description: 'Ponente de ediciones anteriores' },
  { key: 'sponsor', name: 'Patrocinador', description: 'Patrocinador del evento' },
  { key: 'npc', name: 'NPC', description: 'Personaje no jugador del evento' },
  { key: 'admin', name: 'Administrador', description: 'Acceso completo al panel de administración' },
]

const ADMIN_ROLES: UserRole[] = ['admin', 'organization']

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role !== undefined && role !== null && ADMIN_ROLES.includes(role)
}

export function isKnownRole(role: string): role is UserRole {
  return USER_ROLES.some(info => info.key === role)
}

export function roleInfo(role: UserRole): RoleInfo | undefined {
  return USER_ROLES.find(info => info.key === role)
}

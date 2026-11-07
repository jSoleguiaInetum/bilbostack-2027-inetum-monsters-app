import { describe, expect, it } from 'vitest'
import { isAdminRole, isKnownRole, roleInfo, USER_ROLES } from './roles'

describe('roles', () => {
  it('treats only admin as an admin role', () => {
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole('participant')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })

  it('exposes metadata for every role', () => {
    expect(USER_ROLES.map(info => info.key)).toEqual([
      'participant',
      'admin',
    ])
    expect(roleInfo('participant')?.name).toBe('Participante')
    expect(roleInfo('admin')?.name).toBe('Administrador')
  })

  it('validates known roles', () => {
    expect(isKnownRole('participant')).toBe(true)
    expect(isKnownRole('admin')).toBe(true)
    expect(isKnownRole('organization')).toBe(false)
    expect(isKnownRole('hacker')).toBe(false)
  })
})

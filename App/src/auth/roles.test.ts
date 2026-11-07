import { describe, expect, it } from 'vitest'
import { isAdminRole, isKnownRole, roleInfo, USER_ROLES } from './roles'

describe('roles', () => {
  it('treats admin and organization as admin roles', () => {
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole('organization')).toBe(true)
    expect(isAdminRole('participant')).toBe(false)
    expect(isAdminRole('npc')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })

  it('exposes metadata for every role', () => {
    expect(USER_ROLES.map(info => info.key)).toEqual([
      'participant',
      'organization',
      'speaker',
      'ex-speaker',
      'sponsor',
      'npc',
      'admin',
    ])
    expect(roleInfo('organization')?.name).toBe('Organización')
    expect(roleInfo('admin')?.name).toBe('Administrador')
  })

  it('validates known roles', () => {
    expect(isKnownRole('speaker')).toBe(true)
    expect(isKnownRole('ex-speaker')).toBe(true)
    expect(isKnownRole('hacker')).toBe(false)
  })
})

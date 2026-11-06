import { DataError } from '../errors'
import type { ContactsRepository } from '../ports'
import { toContact, type ContactDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiContactsRepository(client: HttpClient): ContactsRepository {
  async function list(userId: string) {
    const dtos = await client.request<ContactDto[]>(
      `/users/${encodeURIComponent(userId)}/contacts`,
    )
    return dtos.map(toContact)
  }

  async function add(
    userId: string,
    contact: Parameters<ContactsRepository['add']>[1],
  ) {
    try {
      await client.request<void>(`/users/${encodeURIComponent(userId)}/contacts`, {
        method: 'POST',
        body: contact,
      })
      return true
    } catch (error) {
      if (error instanceof DataError && error.code === 'CONFLICT') return false
      throw error
    }
  }

  async function isContact(userId: string, targetUserId: string) {
    return (await list(userId)).some(contact => contact.userId === targetUserId)
  }

  return { list, add, isContact }
}

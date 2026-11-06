import type { Contact } from '../types'

export type NewContact = Omit<Contact, 'connectedAt'>

export interface ContactsRepository {
  list(userId: string): Promise<Contact[]>
  add(userId: string, contact: NewContact): Promise<boolean>
  isContact(userId: string, targetUserId: string): Promise<boolean>
}

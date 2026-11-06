import type { Contact } from '../types'
import type { ContactsRepository, NewContact } from '../ports/contacts-repository'
import { readJson, STORAGE_KEYS, userKey, writeJson } from './storage'

function contactsKey(userId: string): string {
  return userKey(STORAGE_KEYS.contacts, userId)
}

async function list(userId: string): Promise<Contact[]> {
  return readJson<Contact[]>(contactsKey(userId), [])
}

async function add(userId: string, contact: NewContact): Promise<boolean> {
  const contacts = await list(userId)
  if (contacts.some((existing) => existing.userId === contact.userId)) return false

  writeJson(contactsKey(userId), [
    ...contacts,
    { ...contact, connectedAt: new Date().toISOString() },
  ])
  return true
}

async function isContact(userId: string, targetUserId: string): Promise<boolean> {
  const contacts = await list(userId)
  return contacts.some((contact) => contact.userId === targetUserId)
}

export const localContactsRepository: ContactsRepository = {
  list,
  add,
  isContact,
}

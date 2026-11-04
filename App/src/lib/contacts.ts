interface Contact {
  userId: string
  name: string
  email: string
  archetype: string
  connectedAt: string
}

const CONTACTS_KEY = 'bilbostack_contacts'

export function getContacts(currentUserId: string): Contact[] {
  const data = localStorage.getItem(`${CONTACTS_KEY}_${currentUserId}`)
  return data ? JSON.parse(data) : []
}

export function addContact(currentUserId: string, contact: Omit<Contact, 'connectedAt'>): boolean {
  const contacts = getContacts(currentUserId)
  if (contacts.find(c => c.userId === contact.userId)) return false
  contacts.push({ ...contact, connectedAt: new Date().toISOString() })
  localStorage.setItem(`${CONTACTS_KEY}_${currentUserId}`, JSON.stringify(contacts))
  return true
}

export function isContact(currentUserId: string, targetUserId: string): boolean {
  return getContacts(currentUserId).some(c => c.userId === targetUserId)
}

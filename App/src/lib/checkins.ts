export interface CheckIn {
  talkId: string
  title: string
  speaker: string
  checkedInAt: string
}

const CHECKINS_KEY = 'bilbostack_checkins'

function storageKey(userId: string): string {
  return `${CHECKINS_KEY}_${userId}`
}

export function getCheckIns(userId: string): CheckIn[] {
  const data = localStorage.getItem(storageKey(userId))
  return data ? JSON.parse(data) : []
}

export function hasCheckedIn(userId: string, talkId: string): boolean {
  return getCheckIns(userId).some(c => c.talkId === talkId)
}

export function addCheckIn(userId: string, checkIn: Omit<CheckIn, 'checkedInAt'>): boolean {
  if (hasCheckedIn(userId, checkIn.talkId)) return false
  const checkIns = getCheckIns(userId)
  checkIns.push({ ...checkIn, checkedInAt: new Date().toISOString() })
  localStorage.setItem(storageKey(userId), JSON.stringify(checkIns))
  return true
}

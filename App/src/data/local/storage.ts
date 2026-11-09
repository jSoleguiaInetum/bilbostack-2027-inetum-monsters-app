export const STORAGE_KEYS = {
  users: 'bilbostack_users',
  session: 'bilbostack_session',
  metrics: 'bilbostack_metrics',
  contacts: 'bilbostack_contacts',
  battles: 'bilbostack_battles',
  fought: 'bilbostack_fought',
  achievements: 'bilbostack_achievements',
  achievementDefinitions: 'bilbostack_achievement_definitions',
  objectDefinitions: 'bilbostack_object_definitions',
  qrs: 'bilbostack_admin_qrs',
  checkins: 'bilbostack_checkins',
  inventory: 'bilbostack_inventory',
  missions: 'bilbostack_missions',
  featureFlags: 'bilbostack_feature_flags',
} as const

export function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeKey(key: string): void {
  localStorage.removeItem(key)
}

export function userKey(base: string, userId: string): string {
  return `${base}_${userId}`
}

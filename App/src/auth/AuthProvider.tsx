import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { OAuthProvider } from '../data/ports'
import { useRepositories } from '../data/DataProvider'
import type { User } from './types'
import type { Archetype } from '../monster/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<User>
  signUpWithEmail: (email: string, password: string, name: string, archetype: Archetype) => Promise<User>
  signInWithOAuth: (provider: OAuthProvider) => Promise<User>
  signOut: () => Promise<void>
  getUserById: (id: string) => Promise<User | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useRepositories()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    auth
      .getSession()
      .then((session) => {
        if (active) setUser(session)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [auth])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const u = await auth.signInWithEmail(email, password)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [auth])

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string, archetype: Archetype) => {
    setLoading(true)
    try {
      const u = await auth.signUpWithEmail(email, password, name, archetype)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [auth])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(true)
    try {
      const u = await auth.signInWithOAuth(provider)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [auth])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setUser(null)
  }, [auth])

  const getUserById = useCallback((id: string) => {
    return auth.getUserById(id)
  }, [auth])

  return (
    <AuthContext value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithOAuth, signOut, getUserById }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

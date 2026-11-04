import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { mockAuth } from './mock-auth'
import type { AuthAdapter, OAuthProvider } from './auth-interface'
import type { User } from './types'
import type { Archetype } from '../monster/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string, archetype: Archetype) => Promise<void>
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>
  signOut: () => Promise<void>
  getUserById: (id: string) => User | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Cambiar este adapter cuando se integre backend real
const auth: AuthAdapter = mockAuth

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = auth.getSession()
    setUser(session)
    setLoading(false)
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const u = await auth.signInWithEmail(email, password)
      setUser(u)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string, archetype: Archetype) => {
    setLoading(true)
    try {
      const u = await auth.signUpWithEmail(email, password, name, archetype)
      setUser(u)
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(true)
    try {
      const u = await auth.signInWithOAuth(provider)
      setUser(u)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setUser(null)
  }, [])

  const getUserById = useCallback((id: string) => {
    return auth.getUserById(id)
  }, [])

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

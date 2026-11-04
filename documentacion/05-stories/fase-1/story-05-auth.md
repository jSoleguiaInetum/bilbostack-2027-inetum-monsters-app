# Story 05 — Auth mock + contexto + rutas protegidas

## Objetivo
Sistema de autenticación con localStorage que permite desarrollar todo el flujo sin backend. La interfaz está preparada para ser reemplazada por un proveedor real (Supabase, Firebase, custom) que soporte:
- Login con email + password
- Login OAuth con LinkedIn
- Login OAuth con Gmail
- Potencialmente otros proveedores OAuth futuros

## Dependencias
- Story 02 (tipos auth)

## Archivos a crear

### `src/auth/auth-interface.ts`

Interfaz agnóstica que define todos los métodos de auth. Cualquier implementación (mock, Supabase, Firebase) debe cumplirla.

```typescript
import type { User } from './types'
import type { Archetype } from '../monster/types'

export type OAuthProvider = 'google' | 'linkedin' | string

export interface AuthAdapter {
  // Email + password
  signUpWithEmail(email: string, password: string, name: string, archetype: Archetype): Promise<User>
  signInWithEmail(email: string, password: string): Promise<User>

  // OAuth (LinkedIn, Gmail, futuros)
  signInWithOAuth(provider: OAuthProvider): Promise<User>

  // Sesión
  signOut(): Promise<void>
  getSession(): User | null
  
  // Usuarios
  getUserById(id: string): User | null
}
```

### `src/auth/mock-auth.ts`

Implementación mock con localStorage. Simula latencia. Los métodos OAuth muestran un alert informativo y crean un usuario simulado.

```typescript
import type { AuthAdapter, OAuthProvider } from './auth-interface'
import type { User } from './types'
import type { Archetype } from '../monster/types'

const USERS_KEY = 'bilbostack_users'
const SESSION_KEY = 'bilbostack_session'

function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockAuth: AuthAdapter = {
  async signUpWithEmail(email, _password, name, archetype) {
    await delay()
    const users = getUsers()
    const normalized = email.trim().toLowerCase()
    if (users.find(u => u.email === normalized)) {
      throw new Error('Email ya registrado')
    }
    const user: User = {
      id: crypto.randomUUID(),
      email: normalized,
      name,
      archetype,
      createdAt: new Date().toISOString(),
    }
    saveUsers([...users, user])
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signInWithEmail(email, _password) {
    await delay()
    const users = getUsers()
    const user = users.find(u => u.email === email.trim().toLowerCase())
    if (!user) throw new Error('Usuario no encontrado')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signInWithOAuth(provider: OAuthProvider) {
    await delay()
    // En modo mock, simulamos un usuario OAuth con email ficticio
    const fakeEmail = `oauth-${provider}-${Date.now()}@mock.bilbostack.dev`
    const user: User = {
      id: crypto.randomUUID(),
      email: fakeEmail,
      name: `Usuario ${provider}`,
      archetype: 'multiclass', // Necesitará seleccionar arquetipo después
      createdAt: new Date().toISOString(),
    }
    const users = getUsers()
    saveUsers([...users, user])
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  },

  async signOut() {
    await delay(100)
    localStorage.removeItem(SESSION_KEY)
  },

  getSession() {
    const data = localStorage.getItem(SESSION_KEY)
    return data ? JSON.parse(data) : null
  },

  getUserById(id: string) {
    const users = getUsers()
    return users.find(u => u.id === id) ?? null
  },
}
```

### `src/auth/AuthProvider.tsx`

React context que envuelve la app. Usa el adapter mock por defecto, reemplazable por otro adapter.

```tsx
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
      const user = await auth.signInWithEmail(email, password)
      setUser(user)
    } finally {
      setLoading(false)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string, archetype: Archetype) => {
    setLoading(true)
    try {
      const user = await auth.signUpWithEmail(email, password, name, archetype)
      setUser(user)
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(true)
    try {
      const user = await auth.signInWithOAuth(provider)
      setUser(user)
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
```

### `src/auth/ProtectedRoute.tsx`

```tsx
import { Navigate } from 'react-router'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-tech animate-pulse">Cargando...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
```

### `src/App.tsx` — Actualizar con Router

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'

// Páginas placeholder (se implementan en stories 06-09)
function LoginPage() { return <div className="min-h-screen bg-background text-white p-8">Login</div> }
function RegisterPage() { return <div className="min-h-screen bg-background text-white p-8">Register</div> }
function MyMonsterPage() { return <div className="min-h-screen bg-background text-white p-8">My Monster</div> }
function ScanPage() { return <div className="min-h-screen bg-background text-white p-8">Scan</div> }
function UserCardPage() { return <div className="min-h-screen bg-background text-white p-8">User Card</div> }

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-monster" element={
            <ProtectedRoute><MyMonsterPage /></ProtectedRoute>
          } />
          <Route path="/scan" element={
            <ProtectedRoute><ScanPage /></ProtectedRoute>
          } />
          <Route path="/user/:id" element={
            <ProtectedRoute><UserCardPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/my-monster" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

## Notas de diseño

### Cómo reemplazar el mock por un backend real

1. Crear nueva implementación de `AuthAdapter` (ej: `supabase-auth.ts`)
2. Cambiar una línea en `AuthProvider.tsx`: `const auth: AuthAdapter = supabaseAuth`
3. Los proveedores OAuth reales usarán `signInWithOAuth('google')` y `signInWithOAuth('linkedin')` que redirigirán al flujo OAuth del proveedor
4. Se pueden añadir más proveedores OAuth simplemente implementando `signInWithOAuth` con el nuevo provider string

### Flujo OAuth mock vs real

- **Mock**: `signInWithOAuth('google')` crea un usuario ficticio instantáneamente. Útil para testing del flujo sin configurar OAuth.
- **Real (futuro)**: `signInWithOAuth('google')` abrirá popup/redirect de Google, recibirá el callback con el token, y creará/recuperará el usuario en la DB.

## Criterios de aceptación

- [ ] Al abrir la app sin sesión, redirige a `/login`
- [ ] `signUpWithEmail` crea usuario en localStorage y establece sesión
- [ ] `signInWithEmail` recupera usuario existente
- [ ] `signInWithOAuth('google')` crea usuario simulado con email mock
- [ ] `signInWithOAuth('linkedin')` crea usuario simulado con email mock
- [ ] `signOut` limpia la sesión y redirige a login
- [ ] Al recargar la página con sesión activa, el usuario sigue autenticado
- [ ] ProtectedRoute muestra loading mientras se recupera la sesión
- [ ] Rutas `/my-monster`, `/scan`, `/user/:id` requieren auth
- [ ] Rutas `/login`, `/register` son públicas
- [ ] `useAuth()` fuera de AuthProvider lanza error
- [ ] El `AuthAdapter` es reemplazable sin tocar componentes

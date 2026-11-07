import { Navigate } from 'react-router'
import { useAuth } from './AuthProvider'
import { isAdminRole } from './roles'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-tech animate-pulse">Cargando...</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdminRole(user.role)) return <Navigate to="/my-monster" replace />

  return <>{children}</>
}

import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'

export function LoginPage() {
  const { signInWithEmail, signInWithOAuth, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/my-monster', { replace: true })
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      navigate('/my-monster')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'linkedin') {
    setError('')
    setLoading(true)
    try {
      await signInWithOAuth(provider)
      navigate('/my-monster')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con OAuth')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2"
          style={{ background: 'linear-gradient(90deg, #232D4B, #E20074, #F5F340)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BilboStack 2027
        </h1>
        <p className="text-tech text-center text-sm mb-8">Tu criatura tech te espera</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="snes-input w-full"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="snes-input w-full"
          />
          {error && <p className="text-rose-color text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="snes-button has-rose-color w-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-primary" />
          <span className="text-gray-500 text-sm">o continúa con</span>
          <div className="flex-1 h-px bg-primary" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="snes-button has-ocean-color w-full"
          >
            🔵 Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('linkedin')}
            disabled={loading}
            className="snes-button has-turquoise-color w-full"
          >
            🔗 LinkedIn
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="snes-link text-ocean-color">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

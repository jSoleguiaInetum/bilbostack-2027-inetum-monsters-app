import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { ArchetypeSelector } from '../components/ArchetypeSelector'
import { generateMonster } from '../monster/generator'
import { useRepositories } from '../data/DataProvider'
import type { Archetype } from '../monster/types'

export function RegisterPage() {
  const { signUpWithEmail, user } = useAuth()
  const { metrics } = useRepositories()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [archetype, setArchetype] = useState<Archetype | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  function handleStep1(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('El nombre debe tener al menos 2 caracteres'); return }
    if (!email.includes('@') || !email.includes('.')) { setError('Email no válido'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setStep(2)
  }

  async function handleSubmit() {
    if (!archetype) { setError('Selecciona un arquetipo'); return }
    setError('')
    setLoading(true)
    try {
      const newUser = await signUpWithEmail(email, password, name.trim(), archetype)
      const { params } = await generateMonster(email.trim().toLowerCase())
      await metrics.initialize(newUser.id, params.rarity.name)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2"
          style={{ background: 'linear-gradient(90deg, #232D4B, #E20074, #F5F340)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BilboStack 2027
        </h1>

        {step === 1 ? (
          <>
            <p className="text-white text-xl font-bold text-center mb-6">Crea tu cuenta</p>
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="snes-input w-full"
              />
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
                placeholder="Contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="snes-input w-full"
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="snes-input w-full"
              />
              {error && <p className="text-rose-color text-sm">{error}</p>}
              <button
                type="submit"
                className="snes-button has-rose-color w-full"
              >
                Siguiente →
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-white text-xl font-bold text-center mb-1">Elige tu arquetipo</p>
            <p className="text-tech text-sm text-center mb-6">Define tu identidad profesional. Tu criatura reflejará tu rol.</p>
            <ArchetypeSelector selected={archetype} onSelect={setArchetype} />
            {error && <p className="text-rose-color text-sm mt-3">{error}</p>}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!archetype || loading}
              className="snes-button has-nature-color w-full mt-6"
            >
              {loading ? 'Creando...' : 'Continuar'}
            </button>
          </>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="snes-link text-ocean-color">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

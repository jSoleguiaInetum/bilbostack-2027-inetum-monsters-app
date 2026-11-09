import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useRepositories } from '../data/DataProvider'
import { REHEARSAL_FEEDBACK_FLOWS, REHEARSAL_STEPS } from '../lib/rehearsal-checklist'
import type { RehearsalFeedback, RehearsalSeedResult } from '../data/ports'

const DEVICE_SUGGESTIONS = ['iPhone SE', 'iPhone 14', 'Galaxy A', 'iPad', 'Chrome Android', 'Otro']

export function RehearsalPage() {
  const { user } = useAuth()
  const { rehearsal } = useRepositories()
  const [seedResult, setSeedResult] = useState<RehearsalSeedResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [feedbackList, setFeedbackList] = useState<RehearsalFeedback[]>([])

  const [rating, setRating] = useState(0)
  const [flow, setFlow] = useState<string>(REHEARSAL_FEEDBACK_FLOWS[0])
  const [device, setDevice] = useState('')
  const [comment, setComment] = useState('')
  const [blocking, setBlocking] = useState(false)

  useEffect(() => {
    let active = true
    rehearsal
      .listFeedback()
      .then((entries) => {
        if (active) setFeedbackList(entries)
      })
      .catch(() => {
        if (active) setFeedbackList([])
      })

    return () => {
      active = false
    }
  }, [rehearsal])

  async function runSeed() {
    setBusy(true)
    setError(null)
    setMessage(null)

    try {
      const result = await rehearsal.seed(user?.id ?? null)
      setSeedResult(result)
      setMessage(
        `Ensayo cargado: ${result.users} usuarios, ${result.contacts} contactos` +
          (result.enrichedCurrentUser ? ' y tu perfil con datos de ensayo' : ''),
      )
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : 'No se pudieron cargar los datos')
    } finally {
      setBusy(false)
    }
  }

  async function runReset() {
    setBusy(true)
    setError(null)
    setMessage(null)

    try {
      await rehearsal.reset()
      setSeedResult(null)
      setFeedbackList(await rehearsal.listFeedback())
      setMessage('Datos de ensayo eliminados')
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'No se pudieron limpiar los datos')
    } finally {
      setBusy(false)
    }
  }

  async function submitFeedback() {
    setError(null)
    setMessage(null)

    if (rating === 0) {
      setError('Elegi una puntuacion')
      return
    }

    try {
      await rehearsal.saveFeedback({
        rating,
        flow,
        device: device.trim() || 'Desconocido',
        comment: comment.trim(),
        blocking,
      })
      setFeedbackList(await rehearsal.listFeedback())
      setComment('')
      setRating(0)
      setBlocking(false)
      setMessage('Feedback registrado correctamente')
    } catch (feedbackError) {
      setError(feedbackError instanceof Error ? feedbackError.message : 'No se pudo guardar el feedback')
    }
  }

  async function copySummary() {
    const summary = feedbackList
      .map((entry) => `- [${entry.rating}/5] ${entry.flow} (${entry.device})${entry.blocking ? ' BLOQUEANTE' : ''}: ${entry.comment}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(`Feedback del ensayo\n${summary}`)
      setMessage('Resumen copiado al portapapeles')
    } catch {
      setError('No se pudo copiar. Selecciona el texto manualmente.')
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <h1 className="text-white font-bold text-lg mb-2 text-center">Ensayo general (Dev)</h1>
      <p className="text-gray-500 text-xs text-center mb-6">
        Datos de ensayo, checklist y feedback. Solo funciona en modo local.
      </p>

      <section className="max-w-lg mx-auto">
        <h2 className="text-white font-bold text-sm mb-2">Datos de ensayo</h2>
        <div className="snes-blockquote p-3 mb-3">
          <p className="text-gray-400 text-[9px] leading-relaxed">
            Carga usuarios ficticios para que rankings y dashboard se vean con volumen real. Si estas
            con sesion, tu perfil tambien se reemplaza con datos de ensayo.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={runSeed}
            disabled={busy}
            className="snes-button has-ocean-color w-full"
          >
            {busy ? 'Cargando...' : 'Cargar datos de ensayo'}
          </button>
          <button
            onClick={runReset}
            disabled={busy}
            className="snes-button w-full"
          >
            Limpiar datos de ensayo
          </button>
        </div>

        {seedResult && (
          <p className="text-tech text-[9px] mt-3">
            {seedResult.users} usuarios · {seedResult.contacts} contactos · {seedResult.achievements}{' '}
            logros · {seedResult.objects} objetos
          </p>
        )}

        {message && <p className="text-tech text-[10px] mt-3">{message}</p>}
        {error && <p className="text-accent text-[10px] mt-3">{error}</p>}
      </section>

      <section className="max-w-lg mx-auto mt-10">
        <h2 className="text-white font-bold text-sm mb-2">Checklist del ensayo</h2>
        <ol className="flex flex-col gap-2">
          {REHEARSAL_STEPS.map((step, index) => (
            <li key={step.id} className="snes-blockquote p-3">
              <p className="text-white text-[9px] font-bold">
                {index + 1}. {step.title}
                {step.needsSecondDevice && <span className="text-accent"> · 2 dispositivos</span>}
                {step.needsPrintedQr && <span className="text-accent"> · QR impreso</span>}
              </p>
              <p className="text-gray-400 text-[8px] mt-1 leading-relaxed">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-lg mx-auto mt-10">
        <h2 className="text-white font-bold text-sm mb-2">Feedback del asistente</h2>
        <div className="snes-blockquote p-3 flex flex-col gap-3">
          <div>
            <p className="text-gray-400 text-[9px] mb-2">Como fue la experiencia?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`snes-button w-full ${rating === value ? 'has-ocean-color' : ''}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-[9px]">Flujo probado</span>
            <select
              value={flow}
              onChange={(event) => setFlow(event.target.value)}
              className="snes-input text-[9px]"
            >
              {REHEARSAL_FEEDBACK_FLOWS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-[9px]">Dispositivo</span>
            <input
              type="text"
              value={device}
              onChange={(event) => setDevice(event.target.value)}
              placeholder="iPhone SE, Galaxy A..."
              className="snes-input text-[9px]"
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {DEVICE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setDevice(suggestion)}
                  className="snes-button text-[8px] px-2 py-1"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-400 text-[9px]">Comentario</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              placeholder="Que fallo, que confunde, que delight..."
              className="snes-input text-[9px]"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={blocking}
              onChange={(event) => setBlocking(event.target.checked)}
            />
            <span className="text-gray-400 text-[9px]">Es un fallo bloqueante</span>
          </label>

          <button onClick={submitFeedback} className="snes-button has-ocean-color w-full">
            Guardar feedback
          </button>
        </div>

        {feedbackList.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-[9px] font-bold">
                Feedback guardado ({feedbackList.length})
              </p>
              <button onClick={copySummary} className="snes-button text-[8px] px-2 py-1">
                Copiar resumen
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {feedbackList.map((entry) => (
                <li key={entry.id} className="snes-blockquote p-2">
                  <p className="text-tech text-[8px]">
                    {entry.rating}/5 · {entry.flow} · {entry.device}
                    {entry.blocking ? ' · BLOQUEANTE' : ''}
                  </p>
                  {entry.comment && <p className="text-gray-300 text-[8px] mt-1">{entry.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}

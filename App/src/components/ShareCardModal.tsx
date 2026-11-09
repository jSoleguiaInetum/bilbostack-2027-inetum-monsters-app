import { useEffect, useRef, useState } from 'react'
import { useRepositories } from '../data/DataProvider'
import { generateMonster } from '../monster/generator'
import {
  buildShareCardModel,
  buildShareLinks,
  buildShareUrl,
  type ShareCardModel,
} from '../lib/share-card'
import { drawShareCard, downloadShareCard } from '../lib/share-card-canvas'
import { Spinner } from './Spinner'
import type { User } from '../auth/types'
import type { PlayerMetrics } from '../lib/metrics'

interface ShareCardModalProps {
  open: boolean
  onClose: () => void
  user: User
  metrics: PlayerMetrics
  featuredAchievementId?: string
}

export function ShareCardModal({
  open,
  onClose,
  user,
  metrics,
  featuredAchievementId,
}: ShareCardModalProps) {
  const { achievements } = useRepositories()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [model, setModel] = useState<ShareCardModel | null>(null)
  const [error, setError] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return

    let active = true
    setModel(null)
    setError(false)
    setActionError(null)
    setCopied(false)

    Promise.all([
      generateMonster(user.email),
      achievements.listDefinitions(),
      achievements.listUnlocked(user.id),
    ]).then(([{ params }, definitions, unlocked]) => {
      if (!active) return

      const unlockedIds = new Set(unlocked.map(achievement => achievement.id))
      const unlockedAchievements = definitions.filter(achievement => unlockedIds.has(achievement.id))
      setModel(buildShareCardModel({
        user,
        metrics,
        params,
        achievements: unlockedAchievements,
        featuredAchievementId,
      }))
    }).catch(() => {
      if (active) setError(true)
    })

    return () => {
      active = false
    }
  }, [open, user, metrics, achievements, featuredAchievementId])

  useEffect(() => {
    if (!open || !model || !canvasRef.current) return

    let active = true
    drawShareCard(canvasRef.current, model).catch(() => {
      if (active) setError(true)
    })

    return () => {
      active = false
    }
  }, [open, model])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const shareUrl = buildShareUrl(window.location.origin)
  const links = model ? buildShareLinks(shareUrl, model.shareText) : null

  async function handleDownload() {
    if (!canvasRef.current || !model) return
    try {
      await downloadShareCard(canvasRef.current, model.fileName)
    } catch {
      setActionError('No se pudo descargar la tarjeta.')
    }
  }

  async function handleCopy() {
    if (!model) return
    try {
      await navigator.clipboard.writeText(`${model.shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setActionError('No se pudo copiar el texto.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-card-title"
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-lg border border-primary bg-surface p-4"
        onClick={event => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 id="share-card-title" className="text-sm font-bold text-white">Compartir tarjeta</h2>
            <p className="mt-2 text-[9px] text-gray-500">Vista previa 1200 × 630 · PNG</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">
            Cerrar
          </button>
        </header>

        {error ? (
          <div className="py-16 text-center">
            <p className="mb-3 text-3xl">📡</p>
            <p className="text-sm text-white">No se pudo generar la tarjeta.</p>
            <p className="mt-2 text-[10px] text-gray-500">Inténtalo de nuevo en unos segundos.</p>
          </div>
        ) : model ? (
          <>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Tarjeta compartible de ${model.featured?.name ?? model.userName}`}
              className="w-full h-auto rounded border border-primary bg-background"
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={handleDownload} className="snes-button has-sunshine-color col-span-2">
                Descargar PNG
              </button>
              <button
                onClick={() => links && window.open(links.linkedin, '_blank', 'noopener,noreferrer')}
                className="snes-button has-ocean-color"
              >
                LinkedIn
              </button>
              <button
                onClick={() => links && window.open(links.twitter, '_blank', 'noopener,noreferrer')}
                className="snes-button has-turquoise-color"
              >
                X / Twitter
              </button>
              <button onClick={handleCopy} className="snes-button has-nature-color col-span-2">
                {copied ? 'Texto copiado' : 'Copiar texto'}
              </button>
            </div>

            {actionError && <p className="mt-3 text-center text-[10px] text-rose-color">{actionError}</p>}
          </>
        ) : (
          <div className="flex justify-center py-20">
            <Spinner size={36} />
          </div>
        )}
      </div>
    </div>
  )
}

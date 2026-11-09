import { useMemo, useState } from 'react'
import { buildAndroidIntentUrl, detectInAppBrowser, isAndroid } from '../lib/inapp'

// Aviso para navegadores in-app (LinkedIn, Instagram, X, etc.): la cámara del
// escáner QR puede fallar y las PWA no se pueden instalar. Ofrecemos abrir en
// el navegador real: en Android con un intent, en iOS copiando el enlace.
export function InAppBrowserBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied] = useState(false)
  const inApp = useMemo(() => detectInAppBrowser(navigator.userAgent), [])
  const android = useMemo(() => isAndroid(navigator.userAgent), [])

  if (!inApp || dismissed) return null

  const openInBrowser = async () => {
    if (android) {
      window.location.href = buildAndroidIntentUrl(window.location.href)
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setCopied(true)
    }
  }

  return (
    <div
      role="alert"
      className="bg-surface border-b border-secondary px-3 py-2 flex items-start gap-2"
    >
      <span aria-hidden="true" className="text-base leading-none mt-0.5">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-[8px] leading-relaxed text-accent">
          Estás en {inApp.name}. La cámara y la instalación pueden fallar.
        </p>
        {!copied ? (
          <button
            onClick={openInBrowser}
            className="mt-1 text-[8px] underline text-tech cursor-pointer"
          >
            Abrir en el navegador
          </button>
        ) : (
          <p className="mt-1 text-[8px] text-tech">
            Enlace copiado: ábrelo en Chrome o Safari.
          </p>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso"
        className="text-gray-500 hover:text-gray-300 text-sm leading-none cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}

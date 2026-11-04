import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { encodeQRPayload } from './qr-codec'
import type { QRPayload } from './types'

interface QRDisplayProps {
  payload: QRPayload
  size?: number
  className?: string
}

export function QRDisplay({ payload, size = 200, className = '' }: QRDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(encodeQRPayload(payload), {
      width: size,
      margin: 2,
      color: { dark: '#232D4B', light: '#FFFFFF' },
    }).then(setQrDataUrl)
  }, [payload, size])

  if (!qrDataUrl) {
    return (
      <div
        className={`bg-surface rounded-lg animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <>
      <img
        src={qrDataUrl}
        alt="Mi QR"
        width={size}
        height={size}
        onClick={() => setFullscreen(true)}
        className={`rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${className}`}
      />

      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-4"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={qrDataUrl}
            alt="Mi QR"
            style={{ width: '80vmin', height: '80vmin' }}
            className="rounded-xl"
          />
          <p className="text-gray-400 text-sm">Toca para cerrar</p>
        </div>
      )}
    </>
  )
}

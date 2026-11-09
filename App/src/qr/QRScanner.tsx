import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { decodeQRPayload } from './qr-codec'
import type { QRPayload } from './types'

interface QRScannerProps {
  onScan: (payload: QRPayload) => void
  onError?: (error: string) => void
  onReady?: () => void
}

export function QRScanner({ onScan, onError, onReady }: QRScannerProps) {
  const scannedRef = useRef(false)
  const runningRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    let cancelled = false

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (scannedRef.current || cancelled) return
          const payload = decodeQRPayload(decodedText)
          if (payload) {
            scannedRef.current = true
            runningRef.current = false
            scanner.stop().catch(() => {})
            onScan(payload)
          } else {
            onError?.('QR no reconocido')
          }
        },
        () => { /* ignorar errores de no-detección frame a frame */ }
      )
      .then(() => {
        runningRef.current = true
        onReady?.()
      })
      .catch(() => {
        onError?.('No se puede acceder a la cámara. Permite el acceso en la configuración de tu navegador.')
      })

    return () => {
      cancelled = true
      if (runningRef.current) {
        runningRef.current = false
        scanner.stop().catch(() => {})
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative">
      <p className="text-tech text-sm text-center mb-3">Apunta al QR</p>
      <div className="relative rounded-xl overflow-hidden border-2 border-primary">
        <div id="qr-reader" style={{ width: '100%' }} />
        {/* Esquinas de enfoque */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent" />
      </div>
    </div>
  )
}

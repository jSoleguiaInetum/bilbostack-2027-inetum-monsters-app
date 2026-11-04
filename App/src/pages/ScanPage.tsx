import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'
import { Spinner } from '../components/Spinner'
import { QRScanner } from '../qr/QRScanner'
import type { QRPayload } from '../qr/types'

export function ScanPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [cameraError, setCameraError] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  function handleScan(payload: QRPayload) {
    if (payload.type === 'person') {
      if (payload.userId === user?.id) {
        setError('No puedes escanearte a ti mismo')
        return
      }
      navigate(`/user/${payload.userId}`, { state: { payload } })
    } else if (payload.type === 'talk') {
      navigate('/talk-checkin', { state: { payload } })
    }
  }

  function handleError(msg: string) {
    if (msg.includes('cámara') || msg.includes('acceso')) {
      setCameraError(true)
    } else {
      setError(msg)
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className="bg-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-primary">
        <h1 className="text-lg font-bold text-white">Escanear QR</h1>
        <button
          onClick={() => navigate('/my-monster')}
          className="text-gray-500 hover:text-white text-sm transition-colors"
        >
          ← Volver
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        {cameraError ? (
          <div className="text-center max-w-xs">
            <p className="text-4xl mb-4">📷</p>
            <p className="text-white font-bold mb-2">Cámara no disponible</p>
            <p className="text-gray-400 text-sm">
              Permite el acceso a la cámara en la configuración de tu navegador y recarga la página.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            {!cameraReady && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Spinner size={48} />
                <p className="text-gray-500 text-sm">Iniciando cámara...</p>
              </div>
            )}
            <QRScanner
              onScan={handleScan}
              onError={handleError}
              onReady={() => setCameraReady(true)}
            />
          </div>
        )}

        {error && (
          <p className="text-secondary text-sm text-center">{error}</p>
        )}
        {!error && !cameraError && cameraReady && (
          <p className="text-gray-500 text-sm animate-pulse">Buscando QR...</p>
        )}
      </main>
    </div>
  )
}

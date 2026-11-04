import { SEED_TALKS } from '../lib/seed-talks'
import { QRDisplay } from '../qr/QRDisplay'

export function DevSeedPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <h1 className="text-white font-bold text-lg mb-2 text-center">QR Charlas (Dev)</h1>
      <p className="text-gray-500 text-xs text-center mb-6">Escanea estos QR para hacer check-in de charlas</p>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {SEED_TALKS.map(talk => (
          <div key={talk.talkId} className="snes-blockquote p-3 flex flex-col items-center gap-2">
            <QRDisplay payload={talk} size={110} />
            <p className="text-white text-[9px] font-bold text-center leading-tight">{talk.title}</p>
            <p className="text-tech text-[8px]">{talk.speaker}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { useRepositories } from '../../data/DataProvider'
import { MISSION_DEFINITIONS } from '../../lib/missions'
import type { GameObject } from '../../lib/objects'
import type { Talk } from '../../lib/seed-talks'
import { encodeQRPayload } from '../../qr/qr-codec'
import type { AdminQr, AdminQrInput, AdminQrType } from '../../qr/types'

const QR_TYPE_LABELS: Record<AdminQrType, string> = {
  talk: 'Charla',
  npc: 'NPC',
  mission: 'Misión',
  object: 'Objeto',
  event: 'Evento',
}

interface QrForm {
  type: AdminQrType
  referenceId: string
  label: string
  description: string
  speaker: string
}

const EMPTY_FORM: QrForm = {
  type: 'talk',
  referenceId: '',
  label: '',
  description: '',
  speaker: '',
}

function downloadName(qr: AdminQr): string {
  const slug = qr.label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `qr-${qr.type}-${slug || qr.id}.png`
}

function AdminQrCard({ qr, onDelete }: { qr: AdminQr; onDelete: (qr: AdminQr) => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(encodeQRPayload(qr.payload), {
      width: 320,
      margin: 2,
      color: { dark: '#232D4B', light: '#FFFFFF' },
    }).then(result => {
      if (active) setDataUrl(result)
    }).catch(() => undefined)

    return () => {
      active = false
    }
  }, [qr])

  function printQr() {
    if (!dataUrl) return
    const printWindow = window.open('', '_blank', 'width=480,height=640')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>${qr.label}</title></head>
        <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:monospace">
          <img src="${dataUrl}" alt="${qr.label}" style="width:360px;height:360px" />
          <h1 style="font-size:18px;margin-top:16px">${qr.label}</h1>
          <p style="font-size:12px;color:#555">${QR_TYPE_LABELS[qr.type]}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 150)
  }

  return (
    <li className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR de ${qr.label}`}
          width={80}
          height={80}
          className="h-20 w-20 rounded border border-primary bg-white p-1"
        />
      ) : (
        <div className="h-20 w-20 animate-pulse rounded border border-primary bg-background" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-white">{qr.label}</p>
        <p className="text-[8px] text-gray-500">
          {QR_TYPE_LABELS[qr.type]} · {new Date(qr.createdAt).toLocaleString('es-ES')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {dataUrl && (
          <a
            href={dataUrl}
            download={downloadName(qr)}
            className="snes-button text-[8px] inline-flex items-center"
          >
            Descargar
          </a>
        )}
        <button type="button" onClick={printQr} disabled={!dataUrl} className="snes-button text-[8px]">
          Imprimir
        </button>
        <button type="button" onClick={() => onDelete(qr)} className="snes-button has-rose-color text-[8px]">
          Eliminar
        </button>
      </div>
    </li>
  )
}

export function AdminQrs() {
  const {
    qrs: qrRepository,
    talks: talksRepository,
    inventory: inventoryRepository,
  } = useRepositories()
  const [qrs, setQrs] = useState<AdminQr[]>([])
  const [talks, setTalks] = useState<Talk[]>([])
  const [objects, setObjects] = useState<GameObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<QrForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [nextQrs, nextTalks, nextObjects] = await Promise.all([
        qrRepository.list(),
        talksRepository.list(),
        inventoryRepository.listAllDefinitions(),
      ])
      setQrs(nextQrs)
      setTalks(nextTalks)
      setObjects(nextObjects)
      setError('')
    } catch {
      setError('No se pudieron cargar los QR.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [qrRepository, talksRepository, inventoryRepository]) // eslint-disable-line react-hooks/exhaustive-deps

  function selectType(type: AdminQrType) {
    setForm({ ...EMPTY_FORM, type })
  }

  function selectReference(referenceId: string) {
    if (form.type === 'talk') {
      const talk = talks.find(item => item.talkId === referenceId)
      setForm({
        ...form,
        referenceId,
        label: talk?.title ?? '',
        speaker: talk?.speaker ?? '',
        description: talk?.description ?? '',
      })
      return
    }
    if (form.type === 'mission') {
      const mission = MISSION_DEFINITIONS.find(item => item.id === referenceId)
      setForm({
        ...form,
        referenceId,
        label: mission?.name ?? '',
        description: mission?.description ?? '',
      })
      return
    }
    if (form.type === 'object') {
      const object = objects.find(item => item.id === referenceId)
      setForm({
        ...form,
        referenceId,
        label: object?.name ?? '',
        description: object?.description ?? '',
      })
      return
    }
    setForm({ ...form, referenceId })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const input: AdminQrInput = {
      type: form.type,
      label: form.label.trim(),
      referenceId: form.referenceId.trim(),
      description: form.description.trim() || undefined,
      speaker: form.speaker.trim() || undefined,
    }

    if (!input.label || !input.referenceId) {
      setError('La etiqueta y el identificador son obligatorios.')
      return
    }

    setSaving(true)
    try {
      await qrRepository.create(input)
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setError('No se pudo generar el QR.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(qr: AdminQr) {
    if (!window.confirm(`¿Eliminar el QR "${qr.label}"?`)) return
    try {
      await qrRepository.delete(qr.id)
      await load()
    } catch {
      setError('No se pudo eliminar el QR.')
    }
  }

  const referenceOptions = form.type === 'talk'
    ? talks.map(talk => ({ value: talk.talkId, label: talk.title }))
    : form.type === 'mission'
      ? MISSION_DEFINITIONS.map(mission => ({ value: mission.id, label: mission.name }))
      : form.type === 'object'
        ? objects.map(object => ({ value: object.id, label: object.name }))
        : []

  return (
    <section aria-label="Códigos QR" className="rounded-lg border border-primary bg-surface">
      <header className="border-b border-primary px-4 py-3">
        <h2 className="text-[11px] font-bold text-accent">🔳 Códigos QR</h2>
        <p className="mt-1 text-[9px] text-gray-500">
          Genera, descarga e imprime QR de charla, NPC, misión, objeto y evento.
        </p>
      </header>

      {error && (
        <p className="border-b border-primary px-4 py-2 text-[9px] text-secondary">{error}</p>
      )}

      <form onSubmit={event => void submit(event)} className="grid gap-3 border-b border-primary px-4 py-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-[9px] text-gray-500">
          Tipo
          <select
            value={form.type}
            onChange={event => selectType(event.target.value as AdminQrType)}
            className="snes-input"
          >
            {(Object.keys(QR_TYPE_LABELS) as AdminQrType[]).map(type => (
              <option key={type} value={type}>{QR_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </label>

        {referenceOptions.length > 0 ? (
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Referencia
            <select
              value={form.referenceId}
              onChange={event => selectReference(event.target.value)}
              className="snes-input"
            >
              <option value="">Selecciona una opción</option>
              {referenceOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Identificador
            <input
              value={form.referenceId}
              onChange={event => setForm({ ...form, referenceId: event.target.value })}
              className="snes-input"
              placeholder="npc-01"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-[9px] text-gray-500">
          Etiqueta
          <input
            value={form.label}
            onChange={event => setForm({ ...form, label: event.target.value })}
            className="snes-input"
            placeholder="Nombre visible"
          />
        </label>

        {form.type === 'talk' && (
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Ponente
            <input
              value={form.speaker}
              onChange={event => setForm({ ...form, speaker: event.target.value })}
              className="snes-input"
              placeholder="Ponente"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-[9px] text-gray-500 md:col-span-2">
          Descripción
          <input
            value={form.description}
            onChange={event => setForm({ ...form, description: event.target.value })}
            className="snes-input"
            placeholder="Texto opcional del QR"
          />
        </label>

        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="snes-button has-nature-color text-[8px]">
            {saving ? 'Generando...' : 'Generar QR'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="px-4 py-8 text-center text-[9px] text-gray-500">Cargando QR...</p>
      ) : qrs.length === 0 ? (
        <p className="px-4 py-8 text-center text-[9px] text-gray-500">
          Todavía no hay QR generados.
        </p>
      ) : (
        <ul className="divide-y divide-primary">
          {qrs.map(qr => (
            <AdminQrCard key={qr.id} qr={qr} onDelete={remove} />
          ))}
        </ul>
      )}
    </section>
  )
}

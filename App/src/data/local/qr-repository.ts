import type { AdminQr, AdminQrInput, QRPayload } from '../../qr/types'
import type { QrRepository } from '../ports/qr-repository'
import { DataError } from '../errors'
import { readJson, STORAGE_KEYS, writeJson } from './storage'

function buildPayload(input: AdminQrInput): QRPayload {
  const referenceId = input.referenceId.trim()
  const label = input.label.trim()
  const description = input.description?.trim() || undefined

  if (!referenceId || !label) {
    throw new DataError('VALIDATION', 'El identificador y la etiqueta son obligatorios')
  }

  switch (input.type) {
    case 'talk':
      return {
        type: 'talk',
        talkId: referenceId,
        title: label,
        speaker: input.speaker?.trim() || 'Ponente',
      }
    case 'npc':
      return { type: 'npc', npcId: referenceId, name: label, description }
    case 'mission':
      return { type: 'mission', missionId: referenceId, name: label, description }
    case 'object':
      return { type: 'object', objectId: referenceId, name: label, description }
    case 'event':
      return { type: 'event', eventId: referenceId, name: label, description }
  }
}

async function list(): Promise<AdminQr[]> {
  return readJson<AdminQr[]>(STORAGE_KEYS.qrs, [])
}

async function create(input: AdminQrInput): Promise<AdminQr> {
  const qr: AdminQr = {
    id: `qr-${crypto.randomUUID()}`,
    type: input.type,
    label: input.label.trim(),
    payload: buildPayload(input),
    createdAt: new Date().toISOString(),
  }
  const qrs = await list()
  writeJson(STORAGE_KEYS.qrs, [qr, ...qrs])
  return qr
}

async function deleteQr(id: string): Promise<void> {
  const qrs = await list()
  writeJson(STORAGE_KEYS.qrs, qrs.filter(qr => qr.id !== id))
}

export const localQrRepository: QrRepository = {
  list,
  create,
  delete: deleteQr,
}

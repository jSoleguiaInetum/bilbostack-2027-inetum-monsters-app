import type { QrRepository } from '../ports/qr-repository'
import { toAdminQr, type AdminQrDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiQrRepository(client: HttpClient): QrRepository {
  async function list() {
    const dtos = await client.request<AdminQrDto[]>('/admin/qrs')
    return dtos.map(toAdminQr)
  }

  async function create(input: Parameters<QrRepository['create']>[0]) {
    const dto = await client.request<AdminQrDto>('/admin/qrs', {
      method: 'POST',
      body: input,
    })
    return toAdminQr(dto)
  }

  async function deleteQr(id: string) {
    await client.request<void>(`/admin/qrs/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  return { list, create, delete: deleteQr }
}

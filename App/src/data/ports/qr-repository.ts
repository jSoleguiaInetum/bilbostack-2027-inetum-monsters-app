import type { AdminQr, AdminQrInput } from '../../qr/types'

export interface QrRepository {
  list(): Promise<AdminQr[]>
  create(input: AdminQrInput): Promise<AdminQr>
  delete(id: string): Promise<void>
}

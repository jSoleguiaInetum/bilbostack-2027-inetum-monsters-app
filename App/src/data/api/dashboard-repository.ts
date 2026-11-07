import type { DashboardRepository } from '../ports'
import type { DashboardOptions } from '../../lib/dashboard'
import { toAdminDashboard, toDashboard, type AdminDashboardDto, type DashboardDto } from './dto'
import type { HttpClient } from './http-client'

export function createApiDashboardRepository(client: HttpClient): DashboardRepository {
  async function getOverview(options: DashboardOptions = {}) {
    const params = new URLSearchParams({
      rankingsLimit: String(options.rankingsLimit ?? 5),
      evolutionsLimit: String(options.evolutionsLimit ?? 10),
    })

    const dto = await client.request<DashboardDto>(`/dashboard/public?${params.toString()}`)
    return toDashboard(dto)
  }

  async function getAdminOverview() {
    const dto = await client.request<AdminDashboardDto>('/dashboard/admin')
    return toAdminDashboard(dto)
  }

  return { getOverview, getAdminOverview }
}

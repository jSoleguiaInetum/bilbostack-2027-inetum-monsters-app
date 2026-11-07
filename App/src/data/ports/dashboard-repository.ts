import type { AdminDashboard, DashboardOptions, PublicDashboard } from '../../lib/dashboard'

export interface DashboardRepository {
  getOverview(options?: DashboardOptions): Promise<PublicDashboard>
  getAdminOverview(): Promise<AdminDashboard>
}

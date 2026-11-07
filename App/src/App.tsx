import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { DataProvider } from './data/DataProvider'
import { MetricsProvider } from './lib/MetricsProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AdminRoute } from './auth/AdminRoute'
import { Layout } from './components/Layout'
import { Spinner } from './components/Spinner'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { MyMonsterPage } from './pages/MyMonsterPage'
import { UserCardPage } from './pages/UserCardPage'

const ScanPage = lazy(() => import('./pages/ScanPage').then(m => ({ default: m.ScanPage })))
const ContactsPage = lazy(() => import('./pages/ContactsPage').then(m => ({ default: m.ContactsPage })))
const BattlePage = lazy(() => import('./pages/BattlePage').then(m => ({ default: m.BattlePage })))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })))
const TalkCheckInPage = lazy(() => import('./pages/TalkCheckInPage').then(m => ({ default: m.TalkCheckInPage })))
const RankingsPage = lazy(() => import('./pages/RankingsPage').then(m => ({ default: m.RankingsPage })))
const PublicDashboardPage = lazy(() => import('./pages/PublicDashboardPage').then(m => ({ default: m.PublicDashboardPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const DevSeedPage = lazy(() => import('./pages/DevSeedPage').then(m => ({ default: m.DevSeedPage })))

function LazyFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Spinner size={48} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <MetricsProvider>
            <Suspense fallback={<LazyFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<PublicDashboardPage />} />
                <Route path="/my-monster" element={
                  <ProtectedRoute>
                    <Layout><MyMonsterPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/scan" element={
                  <ProtectedRoute>
                    <Layout><ScanPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/user/:id" element={
                  <ProtectedRoute>
                    <Layout><UserCardPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <Layout><ContactsPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/battle/:id" element={
                  <ProtectedRoute>
                    <BattlePage />
                  </ProtectedRoute>
                } />
                <Route path="/achievements" element={
                  <ProtectedRoute>
                    <Layout><AchievementsPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/rankings" element={
                  <ProtectedRoute>
                    <Layout><RankingsPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/talk-checkin" element={
                  <ProtectedRoute>
                    <TalkCheckInPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                <Route path="/dev-seed" element={<DevSeedPage />} />
                <Route path="*" element={<Navigate to="/my-monster" replace />} />
              </Routes>
            </Suspense>
          </MetricsProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  )
}

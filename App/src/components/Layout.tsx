import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router'

const NAV_TABS = [
  { path: '/my-monster', icon: '🐾', label: 'Criatura' },
  { path: '/scan', icon: '📷', label: 'QR' },
  { path: '/contacts', icon: '👥', label: 'Contactos' },
  { path: '/achievements', icon: '🏆', label: 'Logros' },
]

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-surface border-t border-primary z-50 flex justify-around py-2">
        {NAV_TABS.map(tab => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={[
                'flex flex-col items-center gap-4 px-4 py-1 rounded-lg transition-colors relative cursor-pointer',
                isActive ? 'text-accent' : 'text-gray-500 hover:text-gray-300',
              ].join(' ')}
            >
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
              )}
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[7px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

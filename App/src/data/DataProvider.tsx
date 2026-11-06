import { createContext, useContext, type ReactNode } from 'react'
import { defaultRepositories } from './index'
import type { Repositories } from './ports'

const DataContext = createContext<Repositories | null>(null)

interface DataProviderProps {
  children: ReactNode
  repositories?: Repositories
}

export function DataProvider({ children, repositories = defaultRepositories }: DataProviderProps) {
  return <DataContext value={repositories}>{children}</DataContext>
}

export function useRepositories(): Repositories {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useRepositories debe usarse dentro de DataProvider')
  }
  return context
}

import { apiRepositories } from './api'
import { DATA_MODE, type DataMode } from './config'
import { localRepositories } from './local'
import type { Repositories } from './ports'

export type { Repositories }

export function createRepositories(mode: DataMode = DATA_MODE): Repositories {
  return mode === 'api' ? apiRepositories : localRepositories
}

export const defaultRepositories = createRepositories()

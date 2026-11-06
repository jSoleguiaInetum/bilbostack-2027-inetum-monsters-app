import { DATA_MODE, type DataMode } from './config'
import { localRepositories } from './local'
import type { Repositories } from './ports'

export type { Repositories }

export function createRepositories(_mode: DataMode = DATA_MODE): Repositories {
  return localRepositories
}

export const defaultRepositories = createRepositories()

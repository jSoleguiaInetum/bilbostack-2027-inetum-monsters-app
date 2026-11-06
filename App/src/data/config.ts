export type DataMode = 'local' | 'api'

const mode = import.meta.env.VITE_DATA_MODE

export const DATA_MODE: DataMode = mode === 'api' ? 'api' : 'local'
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

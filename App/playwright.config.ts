import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://127.0.0.1:${PORT}`

/**
 * Matriz de dispositivos objetivo del evento (ver AGENTS.md §8 y R-17).
 * Solo Chromium: emulamos viewport, DPR y touch. Safari/WebKit queda fuera
 * porque el riesgo real (PWA, camara, in-app browsers) se cubre en el ensayo
 * general con dispositivos fisicos, no con emulacion.
 */
export const DEVICE_MATRIX = [
  { name: 'iphone-se', label: 'iPhone SE', viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 },
  { name: 'iphone-14', label: 'iPhone 14', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 },
  { name: 'galaxy-a', label: 'Galaxy A', viewport: { width: 360, height: 800 }, deviceScaleFactor: 3 },
  { name: 'ipad', label: 'iPad', viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 },
] as const

/**
 * Cobertura de Safari/WebKit con los perfiles reales de iOS. Es la parte
 * relevante de la matriz: en un evento en Bilbao la mayoria de asistentes
 * llegan desde iPhone con Safari, no desde Chrome.
 */
const SAFARI_DEVICES = [
  { name: 'safari-iphone-se', label: 'iPhone SE (Safari)', descriptor: devices['iPhone SE'] },
  { name: 'safari-iphone-14', label: 'iPhone 14 (Safari)', descriptor: devices['iPhone 14'] },
] as const

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  timeout: 30_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/report' }],
  ],
  outputDir: 'e2e/.artifacts',
  use: {
    baseURL: BASE_URL,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    ...DEVICE_MATRIX.map((device) => ({
      name: device.name,
      use: {
        browserName: 'chromium' as const,
        viewport: device.viewport,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    })),
    ...SAFARI_DEVICES.map((device) => ({
      name: device.name,
      use: {
        ...device.descriptor,
      },
    })),
  ],
  webServer: {
    // Siempre se reconstruye y se levanta un servidor propio: reutilizar uno
    // previo puede servir un build viejo y dar falsos verdes. `--strictPort`
    // hace que un puerto ocupado rompa la ejecucion en vez de servir otro puerto.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})

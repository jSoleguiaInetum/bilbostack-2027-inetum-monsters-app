import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public')

describe('PWA manifest', () => {
  const manifest = JSON.parse(readFileSync(join(PUBLIC_DIR, 'manifest.webmanifest'), 'utf8')) as {
    name: string
    lang: string
    start_url: string
    display: string
    icons: { src: string; sizes: string; type: string; purpose?: string }[]
    shortcuts: { name: string; url: string }[]
  }

  it('declara una app instalable en español', () => {
    expect(manifest.name).toContain('BilboStack')
    expect(manifest.lang).toBe('es')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/')
  })

  it('declara iconos any y maskable, y todos existen en public/', () => {
    const purposes = manifest.icons.map((icon) => icon.purpose)
    expect(purposes).toContain('any')
    expect(purposes).toContain('maskable')
    for (const icon of manifest.icons) {
      const filePath = join(PUBLIC_DIR, icon.src.replace(/^\//, ''))
      expect(existsSync(filePath), `falta ${icon.src}`).toBe(true)
    }
  })

  it('los shortcuts apuntan a rutas existentes de la app', () => {
    const routes = ['/', '/qr', '/scan', '/rankings']
    for (const shortcut of manifest.shortcuts) {
      expect(routes).toContain(shortcut.url)
    }
    expect(manifest.shortcuts.length).toBeGreaterThan(0)
  })
})

describe('service worker y offline', () => {
  it('sw.js existe y define instalación, activación y fetch', () => {
    const sw = readFileSync(join(PUBLIC_DIR, 'sw.js'), 'utf8')
    expect(sw).toContain("addEventListener('install'")
    expect(sw).toContain("addEventListener('activate'")
    expect(sw).toContain("addEventListener('fetch'")
  })

  it('offline.html existe como fallback de navegación', () => {
    expect(existsSync(join(PUBLIC_DIR, 'offline.html'))).toBe(true)
  })
})

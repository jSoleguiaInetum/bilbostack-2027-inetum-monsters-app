// Genera los iconos PWA (PNG) desde un diseño pixel-art de 16x16 sin dependencias.
// Uso: node scripts/generate-pwa-icons.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'icons')

const PALETTE = {
  background: [0x0a, 0x0a, 0x14],
  primary: [0x23, 0x2d, 0x4b],
  secondary: [0xe2, 0x00, 0x74],
  accent: [0xf5, 0xf3, 0x40],
  tech: [0x8b, 0xb9, 0xfe],
}

// Cuadrícula lógica 16x16: cara de criatura (cuerpo, ojos, boca, aura).
const GRID = [
  '................',
  '.....a....a.....',
  '....aaaaaaaa....',
  '...abbbbbbbba...',
  '..abbbbbbbbbba..',
  '..abbccbbcbbba..',
  '..abbccbbcbbba..',
  '..abbbbbbbbbba..',
  '..abbbbbbbbbba..',
  '..abbdddddbba..',
  '..abbbbbbbbbba..',
  '...abbbbbbbba...',
  '....aaaaaaaa....',
  '.....a....a.....',
  '................',
  '................',
]

const COLORS = {
  '.': null,
  a: PALETTE.accent,
  b: PALETTE.primary,
  c: PALETTE.tech,
  d: PALETTE.secondary,
}

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filtro none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Dibuja la cuadrícula en `size` px. `scale` encoge la cara (zona segura maskable).
function render(size, faceScale, opaqueBackground) {
  const rgba = Buffer.alloc(size * size * 4)
  const cell = size / 16
  const offset = ((1 - faceScale) * size) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const gx = Math.floor((x - offset) / (cell * faceScale))
      const gy = Math.floor((y - offset) / (cell * faceScale))
      const inGrid = gx >= 0 && gx < 16 && gy >= 0 && gy < 16
      const color = inGrid ? COLORS[GRID[gy][gx]] : null
      if (color) {
        rgba[i] = color[0]
        rgba[i + 1] = color[1]
        rgba[i + 2] = color[2]
        rgba[i + 3] = 255
      } else if (opaqueBackground) {
        rgba[i] = PALETTE.background[0]
        rgba[i + 1] = PALETTE.background[1]
        rgba[i + 2] = PALETTE.background[2]
        rgba[i + 3] = 255
      } else {
        rgba[i + 3] = 0
      }
    }
  }
  return encodePng(size, size, rgba)
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'icon-192.png'), render(192, 1, false))
writeFileSync(join(OUT, 'icon-512.png'), render(512, 1, false))
writeFileSync(join(OUT, 'icon-maskable-512.png'), render(512, 0.8, true))
writeFileSync(join(OUT, 'apple-touch-icon.png'), render(180, 0.9, true))
console.log('Iconos PWA generados en public/icons/')

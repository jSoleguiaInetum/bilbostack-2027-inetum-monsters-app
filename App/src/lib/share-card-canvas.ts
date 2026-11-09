import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_LAYERS,
  SHARE_CARD_WIDTH,
  type ShareCardModel,
} from './share-card'

const FONT_FAMILY = '"Press Start 2P", monospace'
const COLORS = {
  background: '#0a0a14',
  surface: '#131325',
  primary: '#232D4B',
  secondary: '#E20074',
  accent: '#F5F340',
  tech: '#8BB9FE',
  text: '#FFFFFF',
  muted: '#6B7280',
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return cached

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`))
    image.src = src
  })
  imageCache.set(src, promise)
  return promise
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 'normal'): void {
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
): void {
  ctx.fillStyle = color
  roundedRect(ctx, x, y, width, height, radius)
  ctx.fill()
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
): void {
  ctx.strokeStyle = color
  roundedRect(ctx, x, y, width, height, radius)
  ctx.stroke()
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
): number {
  let size = startSize
  while (size > minSize) {
    setFont(ctx, size, 'bold')
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }
  return size
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    }
  }

  if (lines.length < maxLines && line) lines.push(line)

  lines.forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight))
  return y + lines.length * lineHeight
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  const gradient = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)
  gradient.addColorStop(0, '#131325')
  gradient.addColorStop(0.55, COLORS.background)
  gradient.addColorStop(1, '#1a0a18')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  ctx.strokeStyle = 'rgba(139, 185, 254, 0.07)'
  ctx.lineWidth = 1
  for (let x = 0; x <= SHARE_CARD_WIDTH; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, SHARE_CARD_HEIGHT)
    ctx.stroke()
  }
  for (let y = 0; y <= SHARE_CARD_HEIGHT; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(SHARE_CARD_WIDTH, y)
    ctx.stroke()
  }

  const glow = ctx.createRadialGradient(1030, 70, 0, 1030, 70, 320)
  glow.addColorStop(0, 'rgba(226, 0, 116, 0.28)')
  glow.addColorStop(1, 'rgba(226, 0, 116, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)

  ctx.strokeStyle = 'rgba(139, 185, 254, 0.16)'
  ctx.beginPath()
  ctx.moveTo(516, 72)
  ctx.lineTo(516, 508)
  ctx.stroke()
}

function drawMonster(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
): void {
  const centerX = 270
  const centerY = 312
  const radius = 205

  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  glow.addColorStop(0, 'rgba(226, 0, 116, 0.32)')
  glow.addColorStop(0.55, 'rgba(43, 24, 64, 0.35)')
  glow.addColorStop(1, 'rgba(10, 10, 20, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(245, 243, 64, 0.22)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2)
  ctx.stroke()

  const monsterSize = 390
  const monsterX = centerX - monsterSize / 2
  const monsterY = centerY - monsterSize / 2

  images.forEach(image => {
    ctx.drawImage(image, monsterX, monsterY, monsterSize, monsterSize)
  })

  ctx.fillStyle = 'rgba(139, 185, 254, 0.16)'
  ctx.beginPath()
  ctx.ellipse(centerX, 512, 158, 18, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  background: string,
  border: string,
): number {
  setFont(ctx, 9, 'bold')
  const width = ctx.measureText(text).width + 28

  fillRoundedRect(ctx, x, y, width, 32, 8, background)
  strokeRoundedRect(ctx, x, y, width, 32, 8, border)
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 14, y + 17)
  ctx.textBaseline = 'top'

  return width
}

function drawMetricCard(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
): void {
  const width = 180
  const height = 86

  fillRoundedRect(ctx, x, y, width, height, 10, COLORS.surface)
  strokeRoundedRect(ctx, x, y, width, height, 10, 'rgba(35, 45, 75, 0.95)')

  setFont(ctx, 8, 'bold')
  ctx.fillStyle = COLORS.muted
  ctx.fillText(label, x + 16, y + 18)

  setFont(ctx, 22, 'bold')
  ctx.fillStyle = COLORS.text
  ctx.fillText(value, x + 16, y + 44)
}

function drawMonsterAchievements(
  ctx: CanvasRenderingContext2D,
  model: ShareCardModel,
  x: number,
  y: number,
  maxWidth: number,
): void {
  setFont(ctx, 9, 'bold')
  ctx.fillStyle = COLORS.tech
  ctx.fillText(`LOGROS · ${model.achievements.length}`, x, y)

  if (model.achievements.length === 0) {
    setFont(ctx, 10)
    ctx.fillStyle = COLORS.muted
    ctx.fillText('Aún sin logros desbloqueados', x, y + 32)
    return
  }

  const visible = model.achievements.slice(0, 4)
  const gap = 12
  const boxWidth = (maxWidth - gap * 3) / 4

  visible.forEach((achievement, index) => {
    const boxX = x + index * (boxWidth + gap)
    fillRoundedRect(ctx, boxX, y + 30, boxWidth, 92, 10, COLORS.surface)
    strokeRoundedRect(ctx, boxX, y + 30, boxWidth, 92, 10, 'rgba(35, 45, 75, 0.95)')

    setFont(ctx, 24)
    ctx.fillStyle = COLORS.text
    ctx.fillText(achievement.icon, boxX + 12, y + 40)

    setFont(ctx, 8, 'bold')
    ctx.fillStyle = COLORS.text
    drawWrappedText(ctx, achievement.name, boxX + 12, y + 70, boxWidth - 24, 12, 2)
  })

  if (model.achievements.length > visible.length) {
    setFont(ctx, 8, 'bold')
    ctx.fillStyle = COLORS.muted
    ctx.fillText(`+${model.achievements.length - visible.length} más`, x, y + 134)
  }
}

function drawAchievementDetail(
  ctx: CanvasRenderingContext2D,
  model: ShareCardModel,
  x: number,
  y: number,
  maxWidth: number,
): void {
  const featured = model.featured
  if (!featured) return

  setFont(ctx, 54)
  ctx.fillStyle = COLORS.text
  ctx.fillText(featured.icon, x, y)

  setFont(ctx, 10, 'bold')
  ctx.fillStyle = COLORS.tech
  ctx.fillText(`${model.userName} · ${model.archetypeName}`, x, y + 68)

  setFont(ctx, 10)
  ctx.fillStyle = COLORS.text
  drawWrappedText(ctx, featured.description, x, y + 94, maxWidth, 18, 2)
}

function drawContent(ctx: CanvasRenderingContext2D, model: ShareCardModel): void {
  const x = 560
  const maxWidth = 580
  const featured = model.featured

  ctx.fillStyle = COLORS.secondary
  ctx.fillRect(x, 86, 6, 14)

  setFont(ctx, 9, 'bold')
  ctx.fillStyle = COLORS.tech
  ctx.fillText(featured ? 'LOGRO DESBLOQUEADO' : 'MI CRIATURA', x + 18, 86)

  const title = featured ? featured.name : model.userName
  const titleSize = fitFontSize(ctx, title, maxWidth, 30, 14)
  setFont(ctx, titleSize, 'bold')
  ctx.fillStyle = COLORS.text
  ctx.fillText(title, x, 116)

  setFont(ctx, 11, 'bold')
  ctx.fillStyle = COLORS.tech
  ctx.fillText(
    featured ? `${model.userName} · ${model.archetypeName}` : model.archetypeName,
    x,
    168,
  )

  const rarityWidth = drawPill(
    ctx,
    model.rarityName,
    x,
    200,
    model.rarityColor,
    model.rarityBgColor,
    model.rarityColor,
  )
  drawPill(
    ctx,
    model.evolutionLabel,
    x + rarityWidth + 12,
    200,
    COLORS.tech,
    'rgba(139, 185, 254, 0.10)',
    'rgba(139, 185, 254, 0.45)',
  )

  drawMetricCard(ctx, 'EXPERTISE', String(model.expertise), x, 260)
  drawMetricCard(ctx, 'AURA TECH', String(model.auraTech), x + 194, 260)
  drawMetricCard(
    ctx,
    'TOTAL',
    String(model.expertise + model.auraTech),
    x + 388,
    260,
  )

  ctx.strokeStyle = 'rgba(35, 45, 75, 0.95)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, 380)
  ctx.lineTo(x + maxWidth, 380)
  ctx.stroke()

  if (featured) {
    drawAchievementDetail(ctx, model, x, 404, maxWidth)
  } else {
    drawMonsterAchievements(ctx, model, x, 404, maxWidth)
  }
}

function drawBranding(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(35, 45, 75, 0.95)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(70, 550)
  ctx.lineTo(1130, 550)
  ctx.stroke()

  setFont(ctx, 11, 'bold')
  ctx.textBaseline = 'top'
  ctx.fillStyle = COLORS.accent
  ctx.fillText('BILBOSTACK 2027', 70, 574)

  setFont(ctx, 8, 'bold')
  ctx.fillStyle = COLORS.muted
  ctx.fillText('MONSTERS APP', 70, 598)

  setFont(ctx, 11, 'bold')
  ctx.fillStyle = COLORS.secondary
  ctx.textAlign = 'right'
  ctx.fillText('INETUM', 1130, 574)
  ctx.textAlign = 'left'
}

export async function drawShareCard(
  canvas: HTMLCanvasElement,
  model: ShareCardModel,
): Promise<void> {
  canvas.width = SHARE_CARD_WIDTH
  canvas.height = SHARE_CARD_HEIGHT

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo inicializar el lienzo')

  await document.fonts?.ready

  const images = await Promise.all(
    SHARE_CARD_LAYERS.map(layer => loadImage(model.assets[layer])),
  )

  ctx.clearRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  drawBackground(ctx)
  drawMonster(ctx, images)
  drawContent(ctx, model)
  drawBranding(ctx)
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('No se pudo generar la imagen'))
    }, 'image/png')
  })
}

export async function downloadShareCard(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<void> {
  const blob = await canvasToBlob(canvas)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

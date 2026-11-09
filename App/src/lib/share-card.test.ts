import { describe, expect, it } from 'vitest'
import {
  buildShareCardModel,
  buildShareLinks,
  buildShareUrl,
} from './share-card'
import type { Achievement } from './achievements'
import type { PlayerMetrics } from './metrics'
import type { MonsterParams } from '../monster/types'

const user = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  archetype: 'developer' as const,
}

const params: MonsterParams = {
  bodyShape: 1,
  eyesType: 2,
  mouthType: 3,
  accessory: 4,
  pattern: 5,
  auraEffect: 6,
  rarity: { name: 'Épico', color: '#F5F340', bgColor: '#3a2800' },
}

const metrics: PlayerMetrics = { expertise: 12, auraTech: 8, history: [] }

const achievement: Achievement = {
  id: 'first-contact',
  name: 'Primer contacto',
  description: 'Añade a tu primer contacto',
  icon: '🤝',
  hidden: false,
  condition: () => true,
}

describe('share card', () => {
  it('builds the monster card model', () => {
    const model = buildShareCardModel({
      user,
      metrics,
      params,
      achievements: [achievement],
    })

    expect(model.kind).toBe('monster')
    expect(model.featured).toBeNull()
    expect(model.userName).toBe('Ana Pérez')
    expect(model.expertise).toBe(12)
    expect(model.auraTech).toBe(8)
    expect(model.achievements).toHaveLength(1)
    expect(model.fileName).toBe('bilbostack-2027-ana-perez.png')
    expect(model.assets.body).toBe('/monster-assets/body-01-evo-1.svg')
    expect(model.shareText).toContain('12 Expertise')
    expect(model.shareText).toContain('1 logros')
    expect(model.shareText).not.toContain('ana@example.com')
  })

  it('builds an achievement card when one is featured', () => {
    const model = buildShareCardModel({
      user,
      metrics,
      params,
      achievements: [achievement],
      featuredAchievementId: 'first-contact',
    })

    expect(model.kind).toBe('achievement')
    expect(model.featured?.id).toBe('first-contact')
    expect(model.fileName).toBe('bilbostack-2027-logro-primer-contacto.png')
    expect(model.shareText).toContain('Primer contacto')
    expect(model.shareText).toContain('Añade a tu primer contacto')
  })

  it('uses the evolved monster asset and evolution label', () => {
    const model = buildShareCardModel({
      user,
      metrics: { expertise: 40, auraTech: 20, history: [] },
      params,
      achievements: [],
    })

    expect(model.evolutionLabel).toBe('Evolución II')
    expect(model.assets.body).toBe('/monster-assets/body-01-evo-2.svg')
  })

  it('builds encoded social share links', () => {
    const links = buildShareLinks('https://app.test/dashboard', 'Hola mundo #BilboStack')

    expect(links.linkedin).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fapp.test%2Fdashboard',
    )
    expect(links.twitter).toBe(
      'https://twitter.com/intent/tweet?text=Hola%20mundo%20%23BilboStack&url=https%3A%2F%2Fapp.test%2Fdashboard',
    )
  })

  it('normalizes the share URL', () => {
    expect(buildShareUrl('https://app.test/')).toBe('https://app.test/dashboard')
    expect(buildShareUrl('https://app.test')).toBe('https://app.test/dashboard')
  })
})

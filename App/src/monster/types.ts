export type Archetype =
  | 'developer' | 'ux' | 'devops' | 'qa'
  | 'product' | 'management' | 'ia' | 'multiclass'

export interface Rarity {
  name: string
  color: string
  bgColor: string
}

export interface MonsterParams {
  bodyShape: number    // 1-16
  eyesType: number     // 1-16
  mouthType: number    // 1-16
  accessory: number    // 1-16
  pattern: number      // 1-16
  auraEffect: number   // 1-16
  rarity: Rarity
}

export interface MonsterAssets {
  aura: string
  body: string
  pattern: string
  eyes: string
  mouth: string
  accessory: string
  badge: string
}

export type Evolution = 0 | 1 | 2 | 3

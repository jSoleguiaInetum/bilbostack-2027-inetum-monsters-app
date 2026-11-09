import { OBJECTS_BASE_PATH } from './constants'

export type ObjectRarity =
  | 'Inusual'
  | 'Singular'
  | 'Único'
  | 'Épico'
  | 'Legendario'

export type ObjectBenefitType =
  | 'ExpertiseBoost'
  | 'AuraTechBoost'
  | 'Cosmetic'
  | 'Title'
  | 'Special'

export type ObjectSource = 'achievement' | 'qr' | 'battle' | 'mission'

export interface GameObject {
  id: string
  name: string
  description: string
  rarity: ObjectRarity
  benefit: string
  benefitType: ObjectBenefitType
  benefitValue: number
  iconUrl: string
  origin: string
  isActive: boolean
}

export interface ObjectDefinitionInput {
  name: string
  description: string
  rarity: ObjectRarity
  benefit: string
  benefitType: ObjectBenefitType
  benefitValue: number
  iconUrl: string
  origin: string
  isActive: boolean
}

export const OBJECT_RARITIES: ObjectRarity[] = [
  'Inusual',
  'Singular',
  'Único',
  'Épico',
  'Legendario',
]

export const OBJECT_BENEFIT_TYPES: ObjectBenefitType[] = [
  'ExpertiseBoost',
  'AuraTechBoost',
  'Cosmetic',
  'Title',
  'Special',
]

export interface UserObject {
  objectId: string
  obtainedAt: string
  source: ObjectSource
}

export const SEED_OBJECTS: GameObject[] = [
  {
    id: 'object-01',
    name: 'Teclado Mecánico',
    description: 'Un teclado compacto con switches de precisión. Puro estilo retro.',
    rarity: 'Inusual',
    benefit: 'Estilo retro para tu criatura',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-01.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-02',
    name: 'Paleta de Diseño',
    description: 'Una paleta digital con los colores de la marca. Creatividad al máximo.',
    rarity: 'Singular',
    benefit: 'Aspecto creativo desbloqueado',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-02.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-03',
    name: 'Café de Madrugada',
    description: 'El combustible de todo developer. Despierta tu Expertise.',
    rarity: 'Inusual',
    benefit: '+1 Expertise al equiparlo',
    benefitType: 'ExpertiseBoost',
    benefitValue: 1,
    iconUrl: `${OBJECTS_BASE_PATH}/object-03.svg`,
    origin: 'Zona de café',
    isActive: true,
  },
  {
    id: 'object-04',
    name: 'Monitor UltraWide',
    description: 'Más píxeles, más contexto, menos scroll.',
    rarity: 'Singular',
    benefit: '+1 Expertise al equiparlo',
    benefitType: 'ExpertiseBoost',
    benefitValue: 1,
    iconUrl: `${OBJECTS_BASE_PATH}/object-04.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-05',
    name: 'Tablero Kanban',
    description: 'Columnas, post-its y un flujo de trabajo impecable.',
    rarity: 'Inusual',
    benefit: 'Aspecto de planificación desbloqueado',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-05.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-06',
    name: 'Auriculares Noise-Cancelling',
    description: 'Silencio absoluto para entrar en flow.',
    rarity: 'Singular',
    benefit: 'Aspecto de concentración desbloqueado',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-06.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-07',
    name: 'Lupa Cazabugs',
    description: 'Encuentra el bug antes de que te encuentre a ti.',
    rarity: 'Singular',
    benefit: '+1 Expertise al equiparlo',
    benefitType: 'ExpertiseBoost',
    benefitValue: 1,
    iconUrl: `${OBJECTS_BASE_PATH}/object-07.svg`,
    origin: 'Zona de retos',
    isActive: true,
  },
  {
    id: 'object-08',
    name: 'Bicho de Circuito',
    description: 'Una criatura digital que vive entre las pistas del PCB.',
    rarity: 'Único',
    benefit: 'Compañero especial de criatura',
    benefitType: 'Special',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-08.svg`,
    origin: 'Networking',
    isActive: true,
  },
  {
    id: 'object-09',
    name: 'Portátil de Batalla',
    description: 'Compilaciones rápidas y cero ventilador. Pura potencia.',
    rarity: 'Épico',
    benefit: '+2 Expertise al equiparlo',
    benefitType: 'ExpertiseBoost',
    benefitValue: 2,
    iconUrl: `${OBJECTS_BASE_PATH}/object-09.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-10',
    name: 'Termo Infinito',
    description: 'Café caliente hasta la última charla del día.',
    rarity: 'Inusual',
    benefit: 'Aspecto de resistencia desbloqueado',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-10.svg`,
    origin: 'Zona de café',
    isActive: true,
  },
  {
    id: 'object-11',
    name: 'Módulo NVMe',
    description: 'Velocidad de lectura absurda para tus datos.',
    rarity: 'Único',
    benefit: 'Almacenamiento legendario desbloqueado',
    benefitType: 'Special',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-11.svg`,
    origin: 'Inetum',
    isActive: true,
  },
  {
    id: 'object-12',
    name: 'Pendrive Veloz',
    description: 'Todo tu stack cabe en el bolsillo.',
    rarity: 'Inusual',
    benefit: 'Aspecto de portabilidad desbloqueado',
    benefitType: 'Special',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-12.svg`,
    origin: 'Networking',
    isActive: true,
  },
  {
    id: 'object-13',
    name: 'Acreditación VIP',
    description: 'Acceso a los mejores after-parties del evento.',
    rarity: 'Épico',
    benefit: 'Título "VIP" desbloqueado',
    benefitType: 'Title',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-13.svg`,
    origin: 'Organización',
    isActive: true,
  },
  {
    id: 'object-14',
    name: 'Stream Deck',
    description: 'Seis teclas para dominar cualquier directo.',
    rarity: 'Único',
    benefit: 'Aspecto de control total desbloqueado',
    benefitType: 'Special',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-14.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
  {
    id: 'object-15',
    name: 'Libreta de Management',
    description: 'Notas, acuerdos y próximos pasos. El poder del orden.',
    rarity: 'Inusual',
    benefit: 'Aspecto de liderazgo desbloqueado',
    benefitType: 'Cosmetic',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-15.svg`,
    origin: 'Inetum',
    isActive: true,
  },
  {
    id: 'object-16',
    name: 'Smartwatch Cuántico',
    description: 'Mide tu pulso cuando compilas en producción.',
    rarity: 'Legendario',
    benefit: 'Aspecto legendario desbloqueado',
    benefitType: 'Special',
    benefitValue: 0,
    iconUrl: `${OBJECTS_BASE_PATH}/object-16.svg`,
    origin: 'BilboStack',
    isActive: true,
  },
]

export const ARCHETYPES = [
  { key: 'developer', name: 'Developer', icon: '⌨️', description: 'Código, algoritmos y sistemas' },
  { key: 'ux', name: 'UX / Design', icon: '🎨', description: 'Experiencia de usuario y diseño visual' },
  { key: 'devops', name: 'DevOps / Platform', icon: '⚙️', description: 'Infraestructura, CI/CD y cloud' },
  { key: 'qa', name: 'QA', icon: '🔍', description: 'Calidad, testing y automatización' },
  { key: 'product', name: 'Product', icon: '🧭', description: 'Producto, estrategia y roadmap' },
  { key: 'management', name: 'Management', icon: '👑', description: 'Gestión, liderazgo y organización' },
  { key: 'ia', name: 'IA Engineer', icon: '🧠', description: 'Inteligencia artificial y machine learning' },
  { key: 'multiclass', name: 'Multiclass', icon: '🔀', description: 'Perfil híbrido multidisciplinar' },
] as const

export const RARITIES = [
  { name: 'Inusual', threshold: 0.60, color: '#8BB9FE', bgColor: '#232D4B' },
  { name: 'Singular', threshold: 0.82, color: '#D76CFF', bgColor: '#2B1840' },
  { name: 'Único', threshold: 0.93, color: '#4DBF61', bgColor: '#1a3a1a' },
  { name: 'Épico', threshold: 0.98, color: '#F5F340', bgColor: '#3a2800' },
  { name: 'Legendario', threshold: 1.00, color: '#E20074', bgColor: '#3a0020' },
] as const

export const ASSET_COUNTS = {
  bodies: 16,
  eyes: 16,
  mouths: 16,
  accessories: 16,
  patterns: 16,
  auras: 16,
} as const

export const ASSETS_BASE_PATH = '/monster-assets'
export const OBJECTS_BASE_PATH = '/monster-assets/objects'

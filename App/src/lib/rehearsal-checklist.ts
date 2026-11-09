/**
 * Flujos que hay que ejecutar durante el ensayo general (TODO.md, Fase 4).
 *
 * El orden importa: primero lo que un asistente nuevo hace solo, despues lo
 * que necesita un segundo dispositivo y al final lo que depende de la red o
 * del hardware.
 */

export interface RehearsalStep {
  id: string
  title: string
  detail: string
  /** Requiere que otra persona escanee o muestre su QR. */
  needsSecondDevice?: boolean
  /** Requiere un QR impreso o QR de charla. */
  needsPrintedQr?: boolean
}

export const REHEARSAL_STEPS: RehearsalStep[] = [
  {
    id: 'registro',
    title: 'Registro y criatura',
    detail: 'Crear cuenta, elegir arquetipo y ver la criatura generada. Objetivo: menos de 90 segundos.',
  },
  {
    id: 'home',
    title: 'Home',
    detail: 'Entender las metricas, la proxima evolucion y las acciones rapidas sin pedir ayuda.',
  },
  {
    id: 'mi-qr',
    title: 'Mi QR',
    detail: 'Mostrar el QR propio y comprobar que se lee con la camara de otro dispositivo.',
    needsSecondDevice: true,
  },
  {
    id: 'escanear-qr',
    title: 'Escanear QR de otra persona',
    detail: 'Escanear el QR de otra persona y ver el contacto nuevo con su icono de origen.',
    needsSecondDevice: true,
  },
  {
    id: 'qr-charla',
    title: 'Check-in de charla',
    detail: 'Escanear el QR de una charla y comprobar el +5 de Aura Tech y el check-in registrado.',
    needsPrintedQr: true,
  },
  {
    id: 'combate',
    title: 'Combate',
    detail: 'Lanzar un combate, responder al menos una pregunta y ver el resultado con sus recompensas.',
  },
  {
    id: 'logros',
    title: 'Logros y tarjeta',
    detail: 'Desbloquear un logro, compartir la tarjeta y comprobar que la imagen se descarga.',
  },
  {
    id: 'inventario-misiones',
    title: 'Inventario y misiones',
    detail: 'Revisar los objetos obtenidos y el progreso de las misiones (flags activos).',
  },
  {
    id: 'rankings',
    title: 'Rankings',
    detail: 'Ver la posicion propia y las cuatro categorias sin desbordes ni cortes.',
  },
  {
    id: 'pwa',
    title: 'Instalar la PWA',
    detail: 'Anadir a pantalla de inicio y abrir la app instalada sin perder funcionalidad.',
  },
  {
    id: 'offline',
    title: 'Sin cobertura',
    detail: 'Perder la red a mitad de camino y comprobar que hay un estado offline legible.',
  },
  {
    id: 'in-app',
    title: 'Navegador in-app',
    detail: 'Abrir el enlace desde WhatsApp o LinkedIn y usar el banner "Abrir en navegador".',
  },
]

/** Flujos que puede reportar un asistente en el feedback. */
export const REHEARSAL_FEEDBACK_FLOWS = [
  'registro',
  'home',
  'mi-qr',
  'escanear-qr',
  'qr-charla',
  'combate',
  'logros',
  'inventario-misiones',
  'rankings',
  'pwa',
  'offline',
  'in-app',
  'otro',
] as const

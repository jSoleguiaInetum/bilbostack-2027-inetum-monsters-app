export interface Talk {
  talkId: string
  title: string
  speaker: string
}

export const SEED_TALKS: Talk[] = [
  {
    talkId: 'talk-01',
    title: 'El futuro de WebAssembly en el edge',
    speaker: 'Arantxa López',
  },
  {
    talkId: 'talk-02',
    title: 'De monolito a microservicios sin morir en el intento',
    speaker: 'Mikel Etxebarria',
  },
  {
    talkId: 'talk-03',
    title: 'IA generativa en producción: lecciones aprendidas',
    speaker: 'Laura Martínez',
  },
  {
    talkId: 'talk-04',
    title: 'Accesibilidad web: más allá del checklist',
    speaker: 'Gorka Fernández',
  },
  {
    talkId: 'talk-05',
    title: 'Platform Engineering: empoderando equipos de desarrollo',
    speaker: 'Nerea Zubiaga',
  },
  {
    talkId: 'talk-06',
    title: 'Observabilidad distribuida con OpenTelemetry',
    speaker: 'Iñigo Ruiz de Gauna',
  },
  {
    talkId: 'talk-07',
    title: 'Diseño de sistemas resilientes en la nube',
    speaker: 'Ane Berasategi',
  },
  {
    talkId: 'talk-08',
    title: 'Testing en el mundo real: estrategias que funcionan',
    speaker: 'Jon Ander Campos',
  },
]

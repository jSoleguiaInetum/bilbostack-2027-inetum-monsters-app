import type { Archetype } from '../monster/types'

export interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
  archetype: Archetype | 'universal' | 'crossover'
  difficulty: 1 | 2 | 3
}

const QUESTIONS: Question[] = [
  // === DEVELOPER ===
  { id: 'dev-01', text: '¿Qué patrón de diseño usa un objeto para crear otros objetos?', options: ['Factory', 'Singleton', 'Observer', 'Adapter'], correctIndex: 0, archetype: 'developer', difficulty: 1 },
  { id: 'dev-02', text: '¿Cuál es la complejidad de búsqueda en un HashMap?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctIndex: 1, archetype: 'developer', difficulty: 2 },
  { id: 'dev-03', text: '¿Qué principio SOLID dice que una clase debe tener una sola razón para cambiar?', options: ['SRP', 'OCP', 'LSP', 'DIP'], correctIndex: 0, archetype: 'developer', difficulty: 1 },
  { id: 'dev-04', text: '¿Qué estructura de datos usa LIFO?', options: ['Cola', 'Pila', 'Árbol', 'Grafo'], correctIndex: 1, archetype: 'developer', difficulty: 1 },
  { id: 'dev-05', text: '¿Qué es un deadlock?', options: ['Error de memoria', 'Bloqueo mutuo entre procesos', 'Fallo de red', 'Buffer overflow'], correctIndex: 1, archetype: 'developer', difficulty: 2 },
  { id: 'dev-06', text: '¿Qué tipo de testing prueba unidades individuales de código?', options: ['E2E', 'Integración', 'Unitario', 'Smoke'], correctIndex: 2, archetype: 'developer', difficulty: 1 },

  // === UX ===
  { id: 'ux-01', text: '¿Qué ley de UX dice que los usuarios pasan más tiempo en otros sitios que en el tuyo?', options: ['Ley de Jakob', 'Ley de Fitts', 'Ley de Hick', 'Ley de Miller'], correctIndex: 0, archetype: 'ux', difficulty: 2 },
  { id: 'ux-02', text: '¿Cuántos elementos puede retener la memoria de trabajo según Miller?', options: ['3 ± 1', '5 ± 2', '7 ± 2', '10 ± 3'], correctIndex: 2, archetype: 'ux', difficulty: 2 },
  { id: 'ux-03', text: '¿Qué técnica de investigación UX observa al usuario usando el producto?', options: ['Encuesta', 'Test de usabilidad', 'Card sorting', 'Benchmark'], correctIndex: 1, archetype: 'ux', difficulty: 1 },
  { id: 'ux-04', text: '¿Qué principio de Gestalt agrupa elementos cercanos?', options: ['Similitud', 'Proximidad', 'Cierre', 'Continuidad'], correctIndex: 1, archetype: 'ux', difficulty: 1 },
  { id: 'ux-05', text: '¿Qué es un wireframe?', options: ['Prototipo interactivo', 'Esquema estructural de baja fidelidad', 'Mockup final', 'Guía de estilo'], correctIndex: 1, archetype: 'ux', difficulty: 1 },
  { id: 'ux-06', text: '¿Qué ratio de contraste mínimo recomienda WCAG AA para texto normal?', options: ['3:1', '4.5:1', '7:1', '2:1'], correctIndex: 1, archetype: 'ux', difficulty: 3 },

  // === DEVOPS ===
  { id: 'ops-01', text: '¿Qué orquestador de contenedores es el estándar de facto?', options: ['Docker Swarm', 'Kubernetes', 'Mesos', 'Nomad'], correctIndex: 1, archetype: 'devops', difficulty: 1 },
  { id: 'ops-02', text: '¿Qué práctica CI/CD fusiona código frecuentemente en la rama principal?', options: ['Continuous Delivery', 'Continuous Integration', 'Continuous Deployment', 'Trunk-based'], correctIndex: 1, archetype: 'devops', difficulty: 1 },
  { id: 'ops-03', text: '¿Qué es Infrastructure as Code?', options: ['Documentar la infra', 'Gestionar infra con código versionable', 'Monitorizar servidores', 'Hacer backups'], correctIndex: 1, archetype: 'devops', difficulty: 1 },
  { id: 'ops-04', text: '¿Qué significa el "99.9%" en un SLA?', options: ['Uptime garantizado', 'Velocidad de respuesta', 'Cobertura de soporte', 'Ratio de errores'], correctIndex: 0, archetype: 'devops', difficulty: 2 },
  { id: 'ops-05', text: '¿Qué herramienta de IaC creó HashiCorp?', options: ['Ansible', 'Terraform', 'Puppet', 'CloudFormation'], correctIndex: 1, archetype: 'devops', difficulty: 1 },
  { id: 'ops-06', text: '¿Qué tipo de despliegue envía tráfico gradualmente a la nueva versión?', options: ['Blue-Green', 'Canary', 'Rolling', 'Recreate'], correctIndex: 1, archetype: 'devops', difficulty: 2 },

  // === QA ===
  { id: 'qa-01', text: '¿Qué tipo de testing verifica que funcionalidad antigua sigue funcionando?', options: ['Smoke', 'Regresión', 'Exploratoria', 'Aceptación'], correctIndex: 1, archetype: 'qa', difficulty: 1 },
  { id: 'qa-02', text: '¿Qué framework de testing E2E desarrolló Microsoft?', options: ['Cypress', 'Selenium', 'Playwright', 'Puppeteer'], correctIndex: 2, archetype: 'qa', difficulty: 2 },
  { id: 'qa-03', text: '¿Qué es testing de caja negra?', options: ['Sin conocer la implementación interna', 'Con acceso al código fuente', 'Solo en producción', 'Automatizado'], correctIndex: 0, archetype: 'qa', difficulty: 1 },
  { id: 'qa-04', text: '¿Qué pirámide de testing tiene más tests unitarios y menos E2E?', options: ['Pirámide de Testing', 'Cono de Helado', 'Diamante', 'Reloj de Arena'], correctIndex: 0, archetype: 'qa', difficulty: 1 },
  { id: 'qa-05', text: '¿Qué mide la cobertura de código?', options: ['Velocidad de tests', 'Porcentaje de código ejecutado por tests', 'Número de bugs', 'Calidad del código'], correctIndex: 1, archetype: 'qa', difficulty: 1 },
  { id: 'qa-06', text: '¿Qué es mutation testing?', options: ['Cambiar el código para ver si los tests lo detectan', 'Testear mutaciones de datos', 'Pruebas de carga', 'Testing de seguridad'], correctIndex: 0, archetype: 'qa', difficulty: 3 },

  // === PRODUCT ===
  { id: 'pm-01', text: '¿Qué framework prioriza features por valor vs esfuerzo?', options: ['RICE', 'MoSCoW', 'Kano', 'Eisenhower'], correctIndex: 0, archetype: 'product', difficulty: 2 },
  { id: 'pm-02', text: '¿Qué métrica mide la retención de usuarios a lo largo del tiempo?', options: ['DAU', 'Cohort Retention', 'NPS', 'ARPU'], correctIndex: 1, archetype: 'product', difficulty: 2 },
  { id: 'pm-03', text: '¿Qué significan las siglas MVP?', options: ['Most Valuable Product', 'Minimum Viable Product', 'Maximum Value Proposition', 'Market Validation Phase'], correctIndex: 1, archetype: 'product', difficulty: 1 },
  { id: 'pm-04', text: '¿Qué técnica valida una idea antes de construirla?', options: ['Sprint Review', 'Fake Door Test', 'Code Review', 'Pair Programming'], correctIndex: 1, archetype: 'product', difficulty: 2 },
  { id: 'pm-05', text: '¿Qué mide el NPS?', options: ['Net Promoter Score', 'New Product Sales', 'Network Performance Score', 'Node Package System'], correctIndex: 0, archetype: 'product', difficulty: 1 },
  { id: 'pm-06', text: '¿Qué es un Product Discovery?', options: ['Lanzar un producto', 'Explorar problemas y soluciones antes de construir', 'Documentar requisitos', 'Planificar sprints'], correctIndex: 1, archetype: 'product', difficulty: 1 },

  // === MANAGEMENT ===
  { id: 'mng-01', text: '¿Qué ceremonia Scrum revisa cómo mejorar el proceso?', options: ['Sprint Review', 'Daily', 'Retrospectiva', 'Planning'], correctIndex: 2, archetype: 'management', difficulty: 1 },
  { id: 'mng-02', text: '¿Qué modelo describe las etapas de formación de un equipo (forming, storming...)?', options: ['Tuckman', 'Belbin', 'DISC', 'Maslow'], correctIndex: 0, archetype: 'management', difficulty: 2 },
  { id: 'mng-03', text: '¿Qué es el WIP limit en Kanban?', options: ['Máximo de tareas en progreso simultáneamente', 'Velocidad del equipo', 'Límite de sprints', 'Capacidad del servidor'], correctIndex: 0, archetype: 'management', difficulty: 1 },
  { id: 'mng-04', text: '¿Qué mide la velocity en Scrum?', options: ['Velocidad de deploy', 'Puntos de historia completados por sprint', 'Tiempo de respuesta', 'Lines of code'], correctIndex: 1, archetype: 'management', difficulty: 1 },
  { id: 'mng-05', text: '¿Qué estilo de liderazgo delega decisiones al equipo?', options: ['Autocrático', 'Laissez-faire', 'Transformacional', 'Servant Leadership'], correctIndex: 3, archetype: 'management', difficulty: 2 },
  { id: 'mng-06', text: '¿Qué es un OKR?', options: ['Objective and Key Result', 'Operations Key Report', 'Organization Knowledge Repository', 'Outsourcing Key Resource'], correctIndex: 0, archetype: 'management', difficulty: 1 },

  // === IA ===
  { id: 'ia-01', text: '¿Qué arquitectura de red neuronal revolucionó el NLP en 2017?', options: ['CNN', 'RNN', 'Transformer', 'GAN'], correctIndex: 2, archetype: 'ia', difficulty: 2 },
  { id: 'ia-02', text: '¿Qué es overfitting?', options: ['El modelo no aprende', 'El modelo memoriza los datos de entrenamiento', 'El modelo es muy lento', 'El modelo tiene pocos parámetros'], correctIndex: 1, archetype: 'ia', difficulty: 1 },
  { id: 'ia-03', text: '¿Qué técnica de IA genera texto, imágenes o código?', options: ['IA Discriminativa', 'IA Generativa', 'IA Simbólica', 'IA Reactiva'], correctIndex: 1, archetype: 'ia', difficulty: 1 },
  { id: 'ia-04', text: '¿Qué significa RAG en el contexto de LLMs?', options: ['Random Access Generation', 'Retrieval-Augmented Generation', 'Recursive Algorithm Growth', 'Real-time AI Gateway'], correctIndex: 1, archetype: 'ia', difficulty: 2 },
  { id: 'ia-05', text: '¿Qué es fine-tuning?', options: ['Ajustar un modelo preentrenado con datos específicos', 'Entrenar desde cero', 'Optimizar hardware', 'Reducir el tamaño del modelo'], correctIndex: 0, archetype: 'ia', difficulty: 1 },
  { id: 'ia-06', text: '¿Qué métrica evalúa la calidad de un clasificador binario?', options: ['MSE', 'F1-Score', 'BLEU', 'ROUGE'], correctIndex: 1, archetype: 'ia', difficulty: 2 },

  // === UNIVERSAL ===
  { id: 'uni-01', text: '¿Qué protocolo usa HTTPS para cifrar la comunicación?', options: ['SSH', 'TLS/SSL', 'FTP', 'SMTP'], correctIndex: 1, archetype: 'universal', difficulty: 1 },
  { id: 'uni-02', text: '¿Qué significa API?', options: ['Application Programming Interface', 'Automated Process Integration', 'Advanced Programming Instruction', 'Application Process Interaction'], correctIndex: 0, archetype: 'universal', difficulty: 1 },
  { id: 'uni-03', text: '¿Qué sistema de control de versiones es el más usado?', options: ['SVN', 'Mercurial', 'Git', 'Perforce'], correctIndex: 2, archetype: 'universal', difficulty: 1 },
  { id: 'uni-04', text: '¿Qué metodología ágil usa sprints de duración fija?', options: ['Kanban', 'Scrum', 'XP', 'Lean'], correctIndex: 1, archetype: 'universal', difficulty: 1 },
  { id: 'uni-05', text: '¿Qué es el cloud computing?', options: ['Computación en servidores propios', 'Servicios bajo demanda por internet', 'Almacenamiento local', 'Red local de oficina'], correctIndex: 1, archetype: 'universal', difficulty: 1 },
  { id: 'uni-06', text: '¿Qué formato de datos es más ligero que XML?', options: ['CSV', 'JSON', 'YAML', 'TOML'], correctIndex: 1, archetype: 'universal', difficulty: 1 },

  // === CROSSOVER ===
  { id: 'cross-01', text: '¿Qué práctica combina desarrollo y operaciones?', options: ['Agile', 'DevOps', 'Waterfall', 'ITIL'], correctIndex: 1, archetype: 'crossover', difficulty: 1 },
  { id: 'cross-02', text: '¿Qué significa "shift left" en testing?', options: ['Testear más tarde', 'Testear más temprano en el ciclo', 'Testear solo en producción', 'Delegar tests al usuario'], correctIndex: 1, archetype: 'crossover', difficulty: 2 },
  { id: 'cross-03', text: '¿Qué es design thinking?', options: ['Diseño visual', 'Metodología de resolución de problemas centrada en el usuario', 'Patrón de software', 'Framework CSS'], correctIndex: 1, archetype: 'crossover', difficulty: 1 },
  { id: 'cross-04', text: '¿Qué principio tech prioriza "personas sobre procesos"?', options: ['SOLID', 'Manifiesto Ágil', 'ITIL', 'COBIT'], correctIndex: 1, archetype: 'crossover', difficulty: 1 },
]

export function getQuestionsForArchetype(archetype: Archetype, excludeIds: string[] = []): Question[] {
  return QUESTIONS
    .filter(q => q.archetype === archetype && !excludeIds.includes(q.id))
}

export function getUniversalQuestions(excludeIds: string[] = []): Question[] {
  return QUESTIONS
    .filter(q => q.archetype === 'universal' && !excludeIds.includes(q.id))
}

export function getCrossoverQuestions(excludeIds: string[] = []): Question[] {
  return QUESTIONS
    .filter(q => q.archetype === 'crossover' && !excludeIds.includes(q.id))
}

export function pickRandomQuestion(questions: Question[]): Question | null {
  if (questions.length === 0) return null
  return questions[Math.floor(Math.random() * questions.length)]
}

export function selectBattleQuestions(
  playerArchetype: Archetype,
  opponentArchetype: Archetype,
  answeredIds: string[] = [],
): { playerQuestions: Question[]; opponentQuestions: Question[] } {
  const rounds = 3
  const playerQuestions: Question[] = []
  const opponentQuestions: Question[] = []
  const usedIds = new Set(answeredIds)

  for (let i = 0; i < rounds; i++) {
    if (playerArchetype === opponentArchetype) {
      const universals = getUniversalQuestions([...usedIds])
      const q = pickRandomQuestion(universals)
      if (q) {
        playerQuestions.push(q)
        opponentQuestions.push(q)
        usedIds.add(q.id)
      }
    } else {
      const pq = pickRandomQuestion(getQuestionsForArchetype(playerArchetype, [...usedIds]))
      if (pq) { playerQuestions.push(pq); usedIds.add(pq.id) }

      const oq = pickRandomQuestion(getQuestionsForArchetype(opponentArchetype, [...usedIds]))
      if (oq) { opponentQuestions.push(oq); usedIds.add(oq.id) }
    }
  }

  return { playerQuestions, opponentQuestions }
}

# PROMPT: Plan Técnico Ejecutable — BilboStack 2027

Actúa como Technical Program Manager senior con experiencia en aplicaciones web gamificadas, arquitecturas cloud y delivery ágil.

Tu tarea: generar un plan técnico ejecutable para que un equipo de desarrollo pueda iniciar la implementación de BilboStack 2027.

---

## 1. CONTEXTO DEL PROYECTO

**BilboStack 2027** es una web app gamificada para asistentes de un evento tecnológico (conferencia de un día). Transforma el networking, la participación y el aprendizaje en una experiencia tipo videojuego.

**Principio de diseño:**
> "Tú nos dices quién eres al entrar. El juego descubre en qué te has convertido al salir."

**Objetivos (por prioridad):**

1. Fomentar networking entre perfiles distintos
2. Incentivar participación activa en el evento
3. Facilitar aprendizaje
4. Generar contenido compartible (LinkedIn, redes)
5. Impulsar exploración del evento

**Restricción clave:** La app NO busca competición pura. Los combates son un vehículo para conocer gente, no un fin.

---

## 2. MECÁNICAS DEL JUEGO

### Ciclo del jugador

```
Registro → Perfil + Monstruo → Preguntas → Exploración (QR) → Combates → Logros → Evolución → Resultado final
```

### Modelo del jugador

| Elemento | Descripción |
|---|---|
| Perfil | Nombre, email, arquetipo profesional |
| Monstruo | Criatura única generada a partir del perfil. Evoluciona durante el evento |
| Métricas | Expertise (conocimiento) + Aura Tech (participación/networking) |
| Inventario | Objetos obtenidos por logros y actividades |
| Contactos | Otros asistentes escaneados/añadidos |
| Logros | Hitos desbloqueados durante el evento |
| Historial | Combates, evoluciones, estadísticas |

### Métricas principales

| Métrica | Representa | Crece con | Valor inicial |
|---|---|---|---|
| Expertise | Conocimiento técnico, resolución de retos | Preguntas, combates, retos, actividades | 1 (+ bonus por características del email) |
| Aura Tech | Participación, networking, influencia | Contactos, descubrimientos, logros, asistencia a charlas | 1 (+ bonus por categoría del monstruo) |

### Monstruos

- Generado algorítmicamente a partir de: nombre + email + arquetipo
- Todos únicos. Nadie empieza con ventaja decisiva
- Categorías: Inusual → Singular → Único → Épico → Legendario
- Máximo 3 evoluciones durante el evento, basadas en Expertise + Aura Tech
- La categoría inicial NO determina el éxito final

### Arquetipos profesionales

Developer | UX/Design | Product | DevOps/Platform | QA | Management | IA Engineer | Multiclass

Personaliza preguntas y experiencias. No limita la evolución final.

### Sistema de preguntas

- Tres tipos: Universales, Especializadas por rol, Crossover
- Modifican: Expertise, Aura Tech, evoluciones, logros, recompensas

### Sistema QR (eje central de la experiencia)

| Tipo QR | Función |
|---|---|
| Persona | Identificación de participante → combatir o añadir contacto |
| NPC | Personajes del evento con misiones/recompensas |
| Charla | Check-in a sesiones → +Aura Tech |
| Misión | Activa misiones contextuales |
| Objeto | Otorga items al inventario |
| Evento | Triggers de eventos especiales |

Flujo QR: Escaneo → Interacción → Recompensa → Progreso → Evolución

### Combates

1. Escaneo QR del oponente
2. Presentación de monstruos
3. Cuenta atrás
4. Mejor de 3 preguntas (cortas, adaptadas al perfil)
5. Resultado + recompensas

Restricciones:
- Duración < 60 segundos
- Desempate por tiempo de respuesta (muerte súbita posible)
- **Dos participantes solo pueden combatir UNA vez** → incentiva conocer gente nueva

### Contactos

- Tras escanear QR de otro: combatir O añadir contacto
- Diversidad de contactos > cantidad

### Logros

- Hitos del evento. Mínimo +1 Aura Tech
- Pueden otorgar: objetos, Expertise, títulos, misiones, recompensas
- No generan evoluciones directamente

### Objetos

- Propiedades: nombre, descripción, rareza, beneficio, origen
- Rarezas: Inusual → Singular → Único → Épico → Legendario

### Misiones

- Tipos: Base, Contextuales, Activadas por QR
- Objetivo: guiar comportamiento del usuario

---

## 3. ROLES DEL SISTEMA

Participante | Administrador

---

## 4. ALCANCE MVP

**Incluido en MVP:**

- Registro/Login
- Generación de monstruo
- Perfil profesional
- Sistema de preguntas
- Expertise + Aura Tech
- Evolución básica (por métricas)
- QR personal + escaneo QR
- Combates (mejor de 3)
- Contactos
- Logros
- Rankings (Aura Tech, Expertise, Contactos, Victorias)
- Dashboard privado (CRUD: usuarios, roles, logros, objetos, QR, estadísticas)
- Dashboard público (rankings, estadísticas, evoluciones recientes)

**Excluido del MVP (post-MVP):**

- Exploración avanzada
- Objetos con mecánicas complejas
- Misiones dinámicas
- Eventos aleatorios
- Metajuego
- NPC avanzados
- Evolución por tipo de actividad/contactos/logros/misiones

---

## 5. PANTALLAS MVP

1. Onboarding/Login
2. Home
3. Mi Monstruo
4. QR Personal
5. Lector QR
6. Combate
7. Contactos
8. Logros
9. Inventario
10. Rankings
11. Dashboard Privado (admin)
12. Dashboard Público

---

## 6. EXPERIENCIA SOCIAL

Compartible en redes (especialmente LinkedIn):
- Tarjeta final del monstruo
- Logros individuales
- Evoluciones
- Estadísticas personales

---

## 7. IDENTIDAD VISUAL (referencia)

- Tipografía: Poppins
- Paleta: Strong Blue #232D4B | Magenta #E20074 | Yellow Lemon #F5F340
- Gradiente: Strong Blue → Magenta
- Estética: videojuego tech, divertida, geek, profesional

---

## ENTREGABLES REQUERIDOS

Genera los siguientes bloques en este orden. Cada bloque debe tener profundidad suficiente para ser directamente accionable por un equipo de desarrollo.

### A. Arquitectura técnica

- Stack recomendado (frontend, backend, base de datos, infraestructura)
- Diagrama de componentes (ASCII)
- Modelo de datos de alto nivel (entidades, relaciones, campos clave)
- Mapa de módulos y dependencias entre ellos
- Estrategia de generación visual de monstruos
- Decisiones técnicas clave con justificación

### B. Backlog estructurado

- Épicas con descripción y criterios de aceptación
- Historias de usuario priorizadas (formato: "Como [rol], quiero [acción], para [beneficio]")
- Agrupadas por épica
- Estimación relativa (tallas: XS, S, M, L, XL)
- Dependencias entre historias

### C. Plan de ejecución

- Fases del proyecto con entregables por fase
- Cronograma con hitos (tabla con semanas)
- Equipo recomendado (roles, cantidad, dedicación)
- Camino crítico identificado

### D. Riesgos y mitigaciones

Tabla con columnas: Riesgo | Tipo (técnico/funcional/organizativo/adopción) | Probabilidad | Impacto | Mitigación

Mínimo 10 riesgos relevantes y específicos al proyecto (no genéricos).

### E. Estrategia de calidad y operaciones

- QA: tipos de testing, cobertura mínima, testing pre-evento
- DevOps: CI/CD, entornos, estrategia de despliegue
- Observabilidad: logging, métricas, alertas (especialmente para el día del evento)
- Seguridad: autenticación, protección de datos, rate limiting

### F. Criterios de aceptación del MVP

Lista de condiciones verificables que deben cumplirse para considerar el MVP listo para el evento.

---

## INSTRUCCIONES DE FORMATO

- Usa tablas para datos estructurados
- Usa diagramas ASCII para arquitectura y flujos
- Usa listas numeradas para secuencias
- Sé concreto: nombres de tecnologías, estimaciones numéricas, métricas específicas
- No generes introducciones, disclaimers ni resúmenes genéricos
- Empieza directamente con el primer entregable

## GESTIÓN DE INFORMACIÓN FALTANTE

Cuando necesites asumir algo no especificado (presupuesto, tamaño de equipo, número de asistentes, fecha del evento, etc.):

1. Formula una hipótesis razonable para un evento tech de tamaño medio-grande
2. Márcala claramente como **[HIPÓTESIS: descripción]**
3. Explica brevemente por qué elegiste ese valor
4. Continúa el plan sobre esa base

No preguntes. No dejes secciones vacías. No pongas "a definir" ni "TBD".

# C. Plan de Ejecución — BilboStack 2027

**[HIPÓTESIS: El evento BilboStack 2027 se celebra a finales de enero 2027 (último sábado de enero, día 30). BilboStack históricamente se celebra a finales de enero en Bilbao. El desarrollo comienza en la primera semana de octubre 2026, dando ~17 semanas hasta el evento.]**

**[HIPÓTESIS: Equipo de Inetum de 4-5 personas con dedicación parcial (compaginan con otros proyectos). Inetum desarrolla la aplicación para llevarla al evento BilboStack 2027.]**

**[HIPÓTESIS: ~600-800 asistentes esperados, basado en ediciones anteriores de BilboStack.]**

---

## 1. Fases del Proyecto

### Fase 0 — Fundación (Semanas 1-2 | Oct 6 – Oct 19)

**Objetivo:** Infraestructura base, decisiones técnicas cerradas, entorno de desarrollo operativo.

| Entregable | Responsable | Criterio de cierre |
|---|---|---|
| Repo monorepo configurado (frontend + supabase + shared) | Tech Lead | CI ejecuta lint + build sin errores |
| Entorno de desarrollo local con Supabase CLI | DevOps/Backend | `supabase start` levanta PostgreSQL + Auth + Realtime + Storage + Edge Functions locales |
| Base de datos desplegada en entorno dev | DevOps/Backend | Migraciones SQL en `supabase/migrations/` ejecutan sin error, seed con datos de prueba |
| Diseño de modelo de datos finalizado | Tech Lead + Backend | ERD revisado y aprobado por el equipo |
| Pipeline CI básico (lint, build, test) | DevOps | PR no se puede mergear sin CI verde |
| Prototipo navegable de las 3 pantallas core (Figma/similar) | UX/Frontend | Validado internamente en Inetum y con organización BilboStack |
| Algoritmo de generación de monstruos — spike técnico | Backend | Dado nombre+email+arquetipo, genera monstruo con atributos consistentes y únicos |
| Guía de estilo visual (componentes base, paleta, tipografía) | UX/Frontend | Componentes base con SNES.CSS + Tailwind en Storybook: botón, card, input, layout |

### Fase 1 — Core del Jugador (Semanas 3-6 | Oct 20 – Nov 16)

**Objetivo:** Un usuario puede registrarse, ver su monstruo, responder preguntas y ver su perfil.

| Entregable | Responsable | Criterio de cierre |
|---|---|---|
| Registro + Login (email magic link via Supabase Auth) | Full-stack | Usuario se registra, recibe acceso, sesión persiste |
| Onboarding: selección de arquetipo profesional | Frontend | Arquetipo guardado en perfil, influye en generación |
| Generación de monstruo (nombre, especie, aspecto, categoría, stats iniciales) | Edge Function | Monstruo único por usuario, determinista dado el mismo input |
| Pantalla "Mi Monstruo" con visualización | Frontend | Muestra monstruo, stats (Expertise, Aura Tech), categoría |
| Sistema de preguntas (universales + por rol) | Edge Function + Frontend | Usuario responde pregunta, métricas se actualizan correctamente |
| QR personal generado por usuario | Edge Function + Frontend | QR codifica ID único con firma HMAC, se muestra en pantalla, es escaneable |
| Pantalla Home con resumen del estado | Frontend | Muestra monstruo, métricas, accesos rápidos a acciones principales |
| Edge Functions + Triggers de métricas (Expertise + Aura Tech): cálculo, incremento, consulta | Edge Function + DB Triggers | Edge Functions documentadas, triggers testeados, tests unitarios pasan |

### Fase 2 — Interacción Social (Semanas 7-10 | Nov 17 – Dic 14)

**Objetivo:** Los usuarios pueden escanear QRs, combatir, añadir contactos y desbloquear logros.

| Entregable | Responsable | Criterio de cierre |
|---|---|---|
| Lector QR integrado (cámara del dispositivo) | Frontend | Escanea QR de otro usuario, identifica tipo, redirige al flujo correcto |
| Sistema de combate completo | Full-stack | Flujo completo: escaneo → auto-añadir contacto → presentación → 3 rondas (cada jugador recibe pregunta de su propio arquetipo) → resultado → recompensas |
| Restricción de combate único entre pares | Edge Function | Segundo intento de combate entre mismos usuarios muestra mensaje indicando que ya son contactos |
| Sistema de contactos | Full-stack | Añadir contacto tras escaneo QR, lista de contactos, +Aura Tech por diversidad |
| Motor de logros | Edge Function + DB Triggers | Logros se desbloquean automáticamente al cumplir condiciones, +Aura Tech mínimo |
| Pantalla de logros | Frontend | Logros visibles (desbloqueados con detalle, pendientes con pista) y logros ocultos (solo aparecen al desbloquearlos con notificación especial) |
| Pantalla de contactos | Frontend | Lista de contactos con monstruo, arquetipo, fecha e icono de origen (🤝 contacto directo / ⚔️👑 combate ganado / ⚔️💀 perdido / ⚔️🤗 empate) |
| QR de charla + check-in | Full-stack | Escaneo QR de charla registra asistencia, +Aura Tech |
| Sistema de evolución básica (por umbrales de Expertise + Aura Tech) | Edge Function + Frontend | Monstruo evoluciona visualmente al cruzar umbrales, máx 3 evoluciones |

### Fase 3 — Rankings, Dashboards y Social (Semanas 11-14 | Dic 15 – Ene 11)

**Objetivo:** Experiencia completa con rankings, administración y funcionalidad social.

| Entregable | Responsable | Criterio de cierre |
|---|---|---|
| Rankings públicos (Aura Tech, Expertise, Contactos, Victorias) | Full-stack | Rankings en tiempo real, top 10 + posición del usuario |
| Dashboard público (rankings, estadísticas globales, evoluciones recientes) | Frontend | Accesible sin login, datos actualizados cada 30s |
| Dashboard privado — Gestión de usuarios y roles | Full-stack | CRUD completo, asignación de roles (Ponente, NPC, Patrocinador, Admin) |
| Dashboard privado — Gestión de logros y objetos | Full-stack | Crear/editar/activar/desactivar logros y objetos |
| Dashboard privado — Gestión de QRs | Full-stack | Generar QRs por tipo (Charla, NPC, Misión, Objeto, Evento), exportar para impresión |
| Dashboard privado — Estadísticas del evento | Full-stack | Métricas en tiempo real: combates, contactos, logros, usuarios activos |
| Tarjetas compartibles (monstruo final, logros, stats) | Frontend | Genera imagen/OG card compartible en LinkedIn/Twitter, URL con preview |
| Inventario de objetos del usuario | Frontend | Lista de objetos obtenidos con nombre, rareza, origen |
| Misiones base (estáticas, configurables desde dashboard) | Full-stack | Admin crea misiones, usuarios las ven y completan |

### Fase 4 — Hardening y Evento (Semanas 15-17 | Ene 12 – Ene 30)

**Objetivo:** Estabilización, prueba de carga, ensayo general, despliegue a producción, día del evento.

| Entregable | Responsable | Criterio de cierre |
|---|---|---|
| Prueba de carga (~800 usuarios simultáneos) | DevOps + Edge Functions | Edge Functions responden <200ms p95, Supabase Realtime soporta 200 conexiones concurrentes (free tier limit) |
| Test end-to-end del flujo completo (registro → combate → evolución) | QA/Equipo | Flujo completo ejecutado sin errores en entorno staging |
| Ensayo general con 10-20 usuarios reales (equipo Inetum + voluntarios) | Todo el equipo | Feedback recogido, bugs críticos corregidos |
| Seed de datos del evento (charlas, ponentes, QRs, logros, misiones) | Equipo Inetum + Organización BilboStack | Todos los QRs generados e impresos, logros configurados, charlas cargadas |
| Despliegue a producción | DevOps | App en Vercel (frontend) + Supabase (backend), dominio final, SSL activo |
| Runbook del día del evento | Tech Lead | Documento con: monitorización, contactos de guardia, rollback plan, FAQ |
| Monitoring y alertas activos | DevOps | Dashboard de observabilidad operativo, alertas configuradas |
| Plan de contingencia offline | Tech Lead | Procedimiento si la app cae durante el evento |

---

## 2. Cronograma Visual

```
Semana  Oct                    Nov                    Dic                    Ene 2027
        06 13 20 27  03 10 17 24  01 08 15 22 29  05 12 19 26 30
        S1 S2 S3 S4  S5 S6 S7 S8  S9 S10 S11 S12 S13 S14 S15 S16 S17 ██

FASE 0  ██ ██ ·· ··  ·· ·· ·· ··  ·· ··  ··  ··  ··  ··  ··  ··  ··
Fundación

FASE 1  ·· ·· ██ ██  ██ ██ ·· ··  ·· ··  ··  ··  ··  ··  ··  ··  ··
Core Jugador

FASE 2  ·· ·· ·· ··  ·· ·· ██ ██  ██ ██  ··  ··  ··  ··  ··  ··  ··
Interacción Social

FASE 3  ·· ·· ·· ··  ·· ·· ·· ··  ·· ··  ██  ██  ██  ██  ··  ··  ··
Rankings/Dashboards/Social

FASE 4  ·· ·· ·· ··  ·· ·· ·· ··  ·· ··  ··  ··  ··  ··  ██  ██  ██
Hardening + Evento

HITOS   ▼· ·· ·· ··  ·· ·▼ ·· ··  ·· ··  ··  ··  ··  ·▼  ··  ·▼  ▼█
        H1          H2                              H3      H4  H5
```

### Hitos clave

| Hito | Semana | Fecha | Descripción | Criterio Go/No-Go |
|---|---|---|---|---|
| **H1** | S1 | Oct 6 | Kick-off + decisiones técnicas cerradas | Stack elegido, repo creado, equipo confirmado |
| **H2** | S6 | Nov 10 | Demo del Core del Jugador | Un usuario puede registrarse, ver su monstruo y responder preguntas en staging |
| **H3** | S13-14 | Ene 5 | Feature freeze | Todas las features del MVP implementadas. Solo se aceptan bugfixes |
| **H4** | S16 | Ene 19 | Ensayo general | Prueba con usuarios reales, datos del evento cargados, zero bugs críticos |
| **H5** | S17 | Ene 30 | **Día del evento** | App en producción, equipo de guardia, monitoring activo |

---

## 3. Equipo Recomendado

**[HIPÓTESIS: Equipo Inetum con dedicación parcial (60-80%) compaginando con otros proyectos de la empresa. Dedicación sube al 100% en las últimas 3 semanas previas al evento.]**

| Rol | Personas | Dedicación | Responsabilidades clave |
|---|---|---|---|
| **Tech Lead / Fullstack Senior** | 1 | 80% (S1-S14), 100% (S15-S17) | Arquitectura, decisiones técnicas, code review, algoritmo de monstruos, camino crítico |
| **Backend Developer** | 1 | 70% (S1-S14), 100% (S15-S17) | Edge Functions, migraciones SQL, Database Triggers, motor de combate, logros, métricas, integraciones QR, prueba de carga |
| **Frontend Developer** | 1 | 70% (S1-S14), 100% (S15-S17) | UI completa (12 pantallas), lector QR, animaciones de combate/evolución, responsividad |
| **UX/UI Designer** | 1 | 60% (S1-S6), 30% (S7-S14), 50% (S15-S17) | Diseño de pantallas, sistema visual de monstruos, tarjetas compartibles, guía de estilo |
| **DevOps / Infra** | 1 (compartido) | 40% (S1-S2), 20% (S3-S14), 60% (S15-S17) | Supabase CLI, Vercel deploys, GitHub Actions CI/CD, monitoring, prueba de carga, día del evento |

**Total: 4-5 personas, ~3.2 FTE equivalentes en promedio**

### Roles de apoyo (no dedicados)

| Rol | Aporte | Cuándo |
|---|---|---|
| Organización BilboStack | Contenido del evento: charlas, ponentes, horarios. Validación de la experiencia gamificada | S1-S2 (requisitos), S11-S14 (seed datos evento), S16 (ensayo) |
| Equipo UX/contenido Inetum | Preguntas del banco, textos de logros, misiones, validación UX | S1-S14 |
| Testers Inetum + voluntarios | Pruebas manuales del flujo completo | S14-S16 |
| Diseñador gráfico / Ilustrador | Assets visuales de monstruos (si no son generados por IA) | S3-S8 |

---

## 4. Camino Crítico

El camino crítico es la secuencia de tareas cuyo retraso retrasa directamente la fecha del evento. No hay margen en estas tareas.

```
Modelo de datos ──→ Edge Fn + Triggers métricas ──→ Generación de monstruo ──→ Sistema de combate ──→ Evoluciones ──→ Prueba de carga ──→ Ensayo general ──→ EVENTO
     S1                       S3                          S3-S4                    S7-S8               S9-S10            S15                S16              S17
```

### Tareas críticas detalladas

| # | Tarea | Semana | Bloquea a | Riesgo si se retrasa |
|---|---|---|---|---|
| 1 | **Modelo de datos finalizado** | S1-S2 | Todas las Edge Functions y Triggers | Sin modelo, nadie puede desarrollar Edge Functions |
| 2 | **Algoritmo de generación de monstruos** | S3-S4 | Visualización, combate, evolución | Es la feature central. Si no funciona, no hay producto |
| 3 | **Edge Functions + Triggers de métricas (Expertise + Aura Tech)** | S3-S4 | Combate, logros, evolución, rankings | Toda la gamificación depende de estas dos métricas |
| 4 | **Sistema de combate completo** | S7-S8 | Logros de combate, rankings de victorias, restricción de pares | Feature más compleja. Requiere Supabase Realtime Broadcast |
| 5 | **Lector QR funcional en móvil** | S7 | Combate, contactos, check-in charlas | Sin QR funcional, toda la interacción presencial se rompe |
| 6 | **Sistema de evolución** | S9-S10 | Tarjetas compartibles, resultado final | El arco narrativo del monstruo depende de esto |
| 7 | **Prueba de carga** | S15 | Deploy a producción | Si la app no aguanta 800 usuarios, no se puede lanzar |
| 8 | **Seed de datos del evento** | S15-S16 | Ensayo general | Sin charlas, QRs y logros reales, no se puede ensayar |

### Tareas con margen (no críticas pero importantes)

| Tarea | Margen estimado | Consecuencia si se retrasa |
|---|---|---|
| Dashboard privado (admin) | 2-3 semanas | Se puede seed con scripts SQL/JSON en vez de UI |
| Tarjetas compartibles | 2 semanas | Se puede lanzar sin compartición y añadirla post-evento |
| Inventario de objetos | 3 semanas | Funcionalidad secundaria, los objetos se registran pero no se muestran |
| Misiones base | 3 semanas | Se puede prescindir en MVP mínimo |

---

## 5. Dependencias entre Fases

```
                    ┌──────────────┐
                    │   FASE 0     │
                    │  Fundación   │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌────────────────┐      ┌──────────────────┐
     │    FASE 1      │      │   UX/Diseño      │
     │ Core Jugador   │      │  (paralelo S1-6) │
     └────────┬───────┘      └──────────────────┘
              │
              │ Requiere: modelo de datos, auth, Edge Fn + Triggers métricas
              ▼
     ┌────────────────┐
     │    FASE 2      │
     │  Interacción   │
     │    Social      │
     └────────┬───────┘
              │
              │ Requiere: QR funcional, monstruos generados, métricas operativas
              ▼
     ┌────────────────┐
     │    FASE 3      │
     │  Rankings +    │
     │  Dashboards    │
     └────────┬───────┘
              │
              │ Requiere: combates, contactos, logros funcionando
              ▼
     ┌────────────────┐
     │    FASE 4      │
     │  Hardening +   │
     │    Evento      │
     └────────────────┘
```

### Matriz de dependencias inter-fase

| Fase destino | Depende de | Entregable bloqueante |
|---|---|---|
| Fase 1 | Fase 0 | Modelo de datos, entorno dev, pipeline CI |
| Fase 2 | Fase 1 | Auth funcional, Edge Functions + Triggers de métricas, generación de monstruo, QR personal |
| Fase 3 | Fase 2 | Motor de combate, contactos, logros — todos produciendo datos para rankings |
| Fase 4 | Fase 3 | Feature freeze — todas las pantallas implementadas |

### Paralelismos posibles dentro de cada fase

| Fase | Streams paralelos |
|---|---|
| Fase 0 | (A) Infra/CI + (B) Spike monstruos + (C) Prototipo UX |
| Fase 1 | (A) Auth + Onboarding + (B) Generación monstruos + Edge Fn métricas |
| Fase 2 | (A) QR + Combate + (B) Contactos + Logros (tras QR reader) |
| Fase 3 | (A) Dashboard admin + (B) Dashboard público + Rankings + (C) Compartición social |
| Fase 4 | (A) Performance + (B) Seed datos + (C) Testing — todo converge en ensayo general |

---

## 6. Resumen de Esfuerzo por Fase

**[HIPÓTESIS: Estimación en personas-semana, asumiendo ~3.2 FTE de media y semanas de 35-40h efectivas por persona.]**

| Fase | Duración | Personas-semana | % del esfuerzo total |
|---|---|---|---|
| Fase 0 — Fundación | 2 semanas | 8 p/s | 15% |
| Fase 1 — Core Jugador | 4 semanas | 14 p/s | 26% |
| Fase 2 — Interacción Social | 4 semanas | 14 p/s | 26% |
| Fase 3 — Rankings/Dashboards | 4 semanas | 10 p/s | 19% |
| Fase 4 — Hardening/Evento | 3 semanas | 8 p/s | 15% |
| **Total** | **17 semanas** | **~54 p/s** | **100%** |

---

## 7. Decisiones Go/No-Go

Puntos de decisión donde Inetum debe evaluar si el proyecto avanza, se reduce alcance o se cancela.

| Momento | Semana | Pregunta | Si No-Go... |
|---|---|---|---|
| Post-Fundación | S2 | ¿Tenemos stack, modelo de datos y spike de monstruos? | Retrasar 2 semanas o reducir a app sin gamificación |
| Demo Core | S6 | ¿Un usuario puede registrarse y ver su monstruo? | Reducir alcance: eliminar combates, dejar solo QR + contactos |
| Feature Freeze | S13 | ¿Todas las features MVP están implementadas? | Cortar features no críticas (misiones, inventario, compartición) |
| Ensayo General | S16 | ¿La app funciona con usuarios reales bajo carga? | Activar plan B: solo QR de contactos sin gamificación |

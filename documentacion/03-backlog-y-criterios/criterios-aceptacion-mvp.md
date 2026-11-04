# F. Criterios de Aceptación del MVP — BilboStack 2027

**Proyecto de Inetum para el evento BilboStack 2027.**

**[HIPÓTESIS: El evento acoge ~800-1.000 asistentes en un solo día, con 2 tracks paralelos de charlas y zona de stands/networking.]**

Todos los criterios son condiciones binarias (sí/no). El MVP se considera listo para el evento **únicamente cuando el 100% de los criterios funcionales y de seguridad están cumplidos**, y al menos el 90% de los de rendimiento, operacionales y UX.

---

## 1. FUNCIONAL — Registro y Onboarding

| # | Criterio | Verificación |
|---|---|---|
| F-01 | Un usuario puede registrarse con nombre, email y arquetipo profesional | Test E2E: flujo completo de registro con los 8 arquetipos |
| F-02 | No se permiten registros duplicados con el mismo email | Intentar registro con email existente → error controlado |
| F-03 | El usuario puede iniciar sesión tras registrarse y recibe un token válido | Login → token JWT → acceso a rutas protegidas |
| F-04 | El onboarding guía al usuario paso a paso sin posibilidad de saltarse campos obligatorios | Intentar enviar formulario incompleto → validación client-side y server-side |

## 2. FUNCIONAL — Generación de Monstruo

| # | Criterio | Verificación |
|---|---|---|
| F-05 | Al completar el registro, se genera automáticamente un monstruo único | Verificar que el registro devuelve datos del monstruo generado |
| F-06 | Dos usuarios con distinto email nunca reciben el mismo monstruo (especie + aspecto) | Script de colisión: generar 2.000 monstruos con inputs distintos → 0 duplicados |
| F-07 | El monstruo generado tiene: especie, aspecto visual, categoría (Inusual–Legendario), valores iniciales de Expertise y Aura Tech | Inspección de respuesta API para 50 registros de prueba |
| F-08 | La distribución de categorías iniciales no concentra más del 5% en Legendario ni menos del 30% en Inusual | **[HIPÓTESIS: distribución objetivo — Inusual 35%, Singular 30%, Único 20%, Épico 12%, Legendario 3%]** — Análisis estadístico sobre 1.000 generaciones |
| F-09 | La categoría inicial no otorga una ventaja en Expertise superior a +2 respecto a la categoría más baja | Comparar valores iniciales de todas las categorías |

## 3. FUNCIONAL — Perfil Profesional

| # | Criterio | Verificación |
|---|---|---|
| F-10 | El usuario puede ver su perfil completo: nombre, arquetipo, monstruo, Expertise, Aura Tech | Pantalla "Mi Monstruo" muestra todos los campos |
| F-11 | El arquetipo seleccionado personaliza las preguntas recibidas | Usuario Developer recibe preguntas de pool Developer; usuario QA recibe preguntas de pool QA |
| F-12 | El arquetipo no bloquea ninguna funcionalidad ni limita la evolución máxima alcanzable | Dos usuarios con distinto arquetipo pueden alcanzar el mismo nivel máximo de evolución |

## 4. FUNCIONAL — Sistema de Preguntas

| # | Criterio | Verificación |
|---|---|---|
| F-13 | Existen al menos 20 preguntas universales, 10 especializadas por cada arquetipo y 10 crossover cargadas en el sistema | Query directa a base de datos / endpoint admin |
| F-14 | Responder una pregunta correctamente incrementa Expertise en la cantidad definida | Antes/después de respuesta correcta → delta = valor configurado |
| F-15 | Responder una pregunta incorrectamente no resta Expertise (solo no suma) | Respuesta incorrecta → Expertise sin cambio negativo |
| F-16 | Un usuario no recibe la misma pregunta dos veces en el mismo contexto (combate, reto) | Simular 20 interacciones seguidas → 0 preguntas repetidas dentro del pool disponible |
| F-17 | Las preguntas crossover combinan conocimientos de dos arquetipos distintos | Revisión manual de contenido de preguntas crossover |

## 5. FUNCIONAL — Métricas (Expertise y Aura Tech)

| # | Criterio | Verificación |
|---|---|---|
| F-18 | Todo usuario nuevo comienza con Expertise = 1 (más bonus por email, si aplica) | Registro de prueba → verificar valor inicial |
| F-19 | Todo usuario nuevo comienza con Aura Tech = 1 (más bonus por categoría del monstruo) | Registro de prueba → verificar valor inicial |
| F-20 | Expertise aumenta al: responder preguntas, ganar combates, completar retos | Ejecutar cada acción → verificar incremento |
| F-21 | Aura Tech aumenta al: añadir contactos, desbloquear logros, asistir a charlas (QR Charla) | Ejecutar cada acción → verificar incremento |
| F-22 | Las métricas nunca descienden por debajo de 1 | Simular escenario extremo → valor mínimo = 1 |
| F-23 | Los valores de Expertise y Aura Tech se actualizan en tiempo real en la UI tras cada acción | Acción → recarga de pantalla no necesaria → valor actualizado |

## 6. FUNCIONAL — Evolución

| # | Criterio | Verificación |
|---|---|---|
| F-24 | El monstruo puede evolucionar un máximo de 3 veces durante el evento | Forzar 4 evoluciones → la cuarta es rechazada |
| F-25 | La evolución se dispara automáticamente al alcanzar umbrales de Expertise + Aura Tech | Alcanzar umbral exacto → evolución se produce |
| F-26 | Cada evolución cambia visualmente el monstruo de forma perceptible | Comparación visual pre/post evolución para las 3 etapas |
| F-27 | La evolución se notifica al usuario con feedback visual claro (animación o pantalla dedicada) | Test manual: la evolución es visible e inequívoca |
| F-28 | Los umbrales de evolución son alcanzables por un participante activo durante la duración del evento | **[HIPÓTESIS: evento de ~8 horas]** — Simulación: un usuario que combate 10 veces, responde 30 preguntas, escanea 5 charlas y añade 15 contactos alcanza al menos la 2ª evolución |

## 7. FUNCIONAL — QR Personal y Escaneo

| # | Criterio | Verificación |
|---|---|---|
| F-29 | Cada usuario tiene un código QR único accesible desde la pantalla "QR Personal" | Generar QR → decodificar → contiene identificador único del usuario |
| F-30 | El QR personal se puede mostrar con brillo máximo y tamaño suficiente para escaneo a 30 cm | Test en 3 dispositivos reales (iOS/Android) con cámaras distintas |
| F-31 | El lector QR integrado en la app escanea correctamente QR de tipo: Persona, Charla, NPC, Misión, Objeto, Evento | Escanear un QR de cada tipo → acción correcta disparada |
| F-32 | Al escanear un QR Persona, se ofrece la opción de Combatir (que añade automáticamente al oponente como contacto e inicia combate) o Añadir Contacto (solo contacto, sin combate) | Test E2E del flujo de escaneo persona → verificar que combatir crea contacto + batalla |
| F-33 | Al escanear un QR Charla, se registra asistencia y se incrementa Aura Tech | Escanear QR de charla → verificar registro + incremento |
| F-34 | El lector QR funciona en condiciones de baja luminosidad (salas de conferencia) | **[HIPÓTESIS: las salas tienen iluminación parcialmente reducida durante charlas]** — Test en entorno con ~100 lux |
| F-35 | Escanear el propio QR personal no dispara ninguna acción (ni combate ni contacto) | Auto-escaneo → mensaje de error amigable |

## 8. FUNCIONAL — Combates

| # | Criterio | Verificación |
|---|---|---|
| F-36 | Un combate completo (3 preguntas + resultado) se completa en menos de 60 segundos | Medir tiempo de 20 combates de prueba → p95 < 60s |
| F-37 | El combate presenta ambos monstruos antes de iniciar las preguntas | Verificar pantalla de presentación con datos de ambos participantes |
| F-38 | El formato es mejor de 3 preguntas | Ganar 2 de 3 → victoria; perder 2 de 3 → derrota |
| F-39 | Si ambos jugadores fallan en una ronda, la ronda es nula y se juega una ronda extra (máximo 1). El empate global se resuelve por tiempo de respuesta acumulado en rondas ganadas. Si persiste, se juega muerte súbita con pregunta crossover compartida | Simular escenarios: ambos fallan → ronda extra; empate global → desempate por tiempo; empate total → muerte súbita crossover |
| F-40 | Dos participantes solo pueden combatir UNA vez entre sí durante todo el evento | Segundo intento de combate entre mismos usuarios → bloqueado con mensaje explicativo |
| F-41 | El resultado del combate otorga Expertise al ganador y una cantidad menor al perdedor | Verificar incrementos post-combate para ambos participantes |
| F-42 | El historial de combates es visible para el usuario (oponente, resultado, fecha/hora) | Pantalla de historial muestra datos de combates realizados |
| F-43 | En cada ronda de combate, cada jugador recibe una pregunta de su propio arquetipo. Solo la muerte súbita usa pregunta crossover compartida | Combate Developer vs QA → Developer recibe pregunta de pool Developer, QA recibe pregunta de pool QA. Muerte súbita → misma pregunta crossover para ambos |
| F-43b | El countdown por pregunta en combate es de 10 segundos | Medir countdown en pantalla → exactamente 10s. Si no responde a tiempo, se registra como fallo |
| F-43c | Las conexiones Supabase Realtime se abren solo durante un combate activo y se cierran inmediatamente al finalizar | Monitorear conexiones Realtime → se crean al iniciar combate y se destruyen tras el resultado |

## 9. FUNCIONAL — Contactos

| # | Criterio | Verificación |
|---|---|---|
| F-44 | Un usuario puede añadir a otro como contacto tras escanear su QR | Escanear QR → "Añadir contacto" → contacto aparece en lista |
| F-45 | Añadir un contacto incrementa Aura Tech del usuario que añade | Verificar Aura Tech antes/después |
| F-46 | La diversidad de contactos (distintos arquetipos) otorga mayor bonificación que contactos del mismo arquetipo | Añadir contacto de distinto arquetipo → bonus > añadir contacto de mismo arquetipo |
| F-47 | La lista de contactos muestra: nombre, arquetipo, monstruo, momento de conexión e icono de origen (🤝 contacto directo, ⚔️👑 combate ganado, ⚔️💀 combate perdido, ⚔️🤗 combate empatado) | Verificar campos e iconos en pantalla de Contactos para contactos directos y post-combate |
| F-48 | No se puede añadir al mismo contacto dos veces | Segundo intento → bloqueado con feedback |

## 10. FUNCIONAL — Logros

| # | Criterio | Verificación |
|---|---|---|
| F-49 | Existen al menos 15 logros configurados y alcanzables durante el evento | Query a base de datos / panel admin |
| F-50 | Cada logro desbloqueado otorga mínimo +1 Aura Tech | Desbloquear logro → verificar incremento |
| F-51 | Los logros se desbloquean automáticamente al cumplir la condición (no requieren acción manual del usuario) | Cumplir condición de logro → notificación automática |
| F-52 | Los logros desbloqueados son visibles en la pantalla de Logros con icono, nombre, descripción y timestamp | Verificar pantalla tras desbloqueo |
| F-53 | Los logros visibles pendientes se muestran con estado bloqueado y pista de cómo conseguirlos | Pantalla de Logros muestra logros visibles no conseguidos con pista |
| F-53b | Los logros ocultos no aparecen en la lista hasta ser desbloqueados, momento en que se revelan con notificación especial de descubrimiento | Desbloquear logro oculto → aparece en lista con notificación diferenciada de los logros visibles |

## 11. FUNCIONAL — Rankings

| # | Criterio | Verificación |
|---|---|---|
| F-54 | Existen 4 rankings: Más Aura Tech, Más Expertise, Más Contactos, Más Victorias | Verificar 4 tabs/secciones en pantalla Rankings |
| F-55 | Los rankings se actualizan en un máximo de 30 segundos tras una acción que modifique la posición | Acción → esperar 30s → ranking actualizado |
| F-56 | El usuario puede ver su posición actual en cada ranking | Indicador de posición propia visible aunque no esté en top |
| F-57 | Los rankings muestran al menos el top 20 | Verificar longitud de lista |

## 12. FUNCIONAL — Dashboard Privado (Admin)

| # | Criterio | Verificación |
|---|---|---|
| F-58 | Un administrador puede crear, editar y eliminar: usuarios, roles, logros, objetos, códigos QR | CRUD completo para cada entidad |
| F-59 | El dashboard muestra estadísticas en tiempo real: usuarios registrados, combates realizados, logros desbloqueados, contactos generados | Verificar contadores tras acciones de prueba |
| F-60 | Solo usuarios con rol Administrador pueden acceder al dashboard privado | Intento de acceso con rol Participante → redirigido/bloqueado |
| F-61 | El administrador puede generar códigos QR de todos los tipos (Charla, NPC, Misión, Objeto, Evento) | Generar QR de cada tipo → descargable/imprimible |

## 13. FUNCIONAL — Dashboard Público

| # | Criterio | Verificación |
|---|---|---|
| F-62 | El dashboard público es accesible sin autenticación | Acceder a la URL sin login → contenido visible |
| F-63 | Muestra los 4 rankings, estadísticas globales y evoluciones recientes | Verificar todas las secciones presentes |
| F-64 | Se actualiza automáticamente sin recargar la página | **[HIPÓTESIS: actualización vía polling cada 30s o Supabase Realtime Broadcast]** — Dejar abierto 2 minutos → datos se refrescan solos |

## 14. FUNCIONAL — Experiencia Social

| # | Criterio | Verificación |
|---|---|---|
| F-65 | El usuario puede generar una tarjeta compartible con su monstruo final, estadísticas y logros | Botón "Compartir" → genera imagen/card |
| F-66 | La tarjeta compartible incluye branding de Inetum y BilboStack 2027 (logos, paleta, tipografía Poppins) | Revisión visual de la tarjeta generada — ambos logos presentes |
| F-67 | La tarjeta se puede compartir directamente en LinkedIn con un clic | Flujo de compartir → abre LinkedIn con contenido pre-rellenado |
| F-68 | Los logros individuales son compartibles de forma independiente | Botón de compartir en cada logro desbloqueado |

---

## 15. RENDIMIENTO

**[HIPÓTESIS: pico de concurrencia de ~500 usuarios simultáneos durante los primeros 30 minutos del evento y durante descansos. Capacidad total: 1.000 usuarios registrados.]**

| # | Criterio | Verificación |
|---|---|---|
| R-01 | Tiempo de carga inicial de la app (first contentful paint) < 2 segundos en conexión 4G | Lighthouse / WebPageTest con throttling 4G |
| R-02 | Tiempo de respuesta de la API para operaciones de lectura (perfil, rankings, logros) < 200ms en p95 | Test de carga con k6/Artillery: 500 usuarios concurrentes |
| R-03 | Tiempo de respuesta de la API para operaciones de escritura (registro, combate, contacto) < 500ms en p95 | Test de carga con k6/Artillery: 500 usuarios concurrentes |
| R-04 | El escaneo QR desde captura de cámara hasta respuesta del servidor < 1.5 segundos | Medición end-to-end en dispositivos reales |
| R-05 | El sistema soporta 100 combates simultáneos sin degradación de respuesta | Test de carga específico de endpoint de combate |
| R-06 | La generación de monstruo durante el registro < 3 segundos | Medir 100 registros consecutivos → p99 < 3s |
| R-07 | El dashboard público soporta 200 conexiones simultáneas sin degradación | Test de carga sobre el endpoint público |
| R-08 | La base de datos soporta 1.000 registros de usuario + 10.000 combates + 15.000 contactos sin degradación de queries | Seed de datos + medición de queries principales |

---

## 16. SEGURIDAD

| # | Criterio | Verificación |
|---|---|---|
| S-01 | Todas las comunicaciones usan HTTPS (TLS 1.2+). No hay endpoints HTTP sin redirección | Scan con ssllabs.com o equivalente |
| S-02 | La autenticación usa JWT con expiración máxima de 24 horas | Inspeccionar token → campo `exp` ≤ 24h |
| S-03 | Los tokens se invalidan al cerrar sesión | Logout → reutilizar token → rechazado (401) |
| S-04 | Los endpoints de admin requieren rol Administrador; un token de Participante recibe 403 | Test con token de participante contra cada ruta admin |
| S-05 | Los inputs de usuario están validados y sanitizados contra XSS e inyección | Enviar payloads maliciosos en nombre, email → rechazados o neutralizados |
| S-06 | Existe rate limiting en endpoints críticos: login (10 req/min), registro (5 req/min), combate (20 req/min) | **[HIPÓTESIS: valores de rate limit razonables para evento de un día]** — Superar límite → respuesta 429 |
| S-07 | La autenticación usa Supabase Auth Magic Link exclusivamente — no existen contraseñas en el sistema. Los códigos QR se firman con HMAC-SHA256 verificable server-side en Edge Function `qr-resolve` | Verificar que no existen campos de contraseña en la DB. Decodificar QR → verificar firma HMAC válida |
| S-08 | Los datos personales (email) no se exponen en endpoints públicos (rankings, dashboard público) | Inspección de respuestas de API pública → solo nombre y arquetipo visibles |
| S-09 | Los QR de usuario no contienen datos personales en claro (solo un identificador opaco) | Decodificar QR → verificar que no contiene email ni nombre |
| S-10 | No se puede manipular el resultado de un combate enviando respuestas directamente a la API (sin pasar por el flujo de preguntas) | Enviar respuesta a endpoint de combate sin sesión de combate activa → rechazado |

---

## 17. OPERACIONAL

| # | Criterio | Verificación |
|---|---|---|
| O-01 | Existe un runbook documentado con procedimientos para: rollback de deploy (Vercel + Supabase), limpieza de caché del navegador / CDN de Supabase Storage, bloqueo de usuario | Documento revisado y validado por el equipo Inetum |
| O-02 | El rollback a la versión anterior se puede ejecutar en menos de 5 minutos | Simulacro de rollback cronometrado |
| O-03 | Existe un plan de contingencia para caída total: modo "solo lectura" que muestra rankings y estadísticas estáticas | Activar modo contingencia → verificar que se muestra contenido cacheado |
| O-04 | Se ha ejecutado un test de carga con el volumen esperado (1.000 usuarios, 500 concurrentes) y los resultados son satisfactorios | Informe de test de carga con métricas pasando umbrales de R-01 a R-08 |
| O-05 | El sistema de monitorización está activo y genera alertas automáticas para: error rate > 5%, latencia p95 > 1s, CPU > 80%, memoria > 85% | Simular cada condición → alerta recibida en canal configurado |
| O-06 | Los logs son accesibles de forma centralizada y permiten buscar por usuario, sesión y timestamp | Buscar logs de un usuario de prueba específico → resultados relevantes |
| O-07 | Existe un canal de comunicación operativo (Slack/Teams/WhatsApp) para el equipo técnico durante el día del evento | Canal creado, miembros añadidos, test de notificación enviado |
| O-08 | La base de datos tiene backup automatizado con retención mínima de 7 días | Verificar política de backup + restaurar un backup de prueba |
| O-09 | Los secretos (API keys, tokens, credenciales de base de datos) no están hardcodeados en el código fuente | Scan con truffleHog, gitleaks o equivalente → 0 secretos detectados |
| O-10 | El uptime objetivo del día del evento es ≥ 99.5% (~4 minutos de downtime máximo en 8 horas) | **[HIPÓTESIS: el evento dura ~8 horas]** — SLA documentado y comunicado al equipo |
| O-11 | El despliegue a producción se puede realizar sin downtime (blue-green o rolling update) | Simular deploy → verificar 0 peticiones fallidas durante la transición |

---

## 18. UX / EXPERIENCIA DE USUARIO

| # | Criterio | Verificación |
|---|---|---|
| U-01 | La app es mobile-first y completamente funcional en pantallas desde 375px de ancho | Test en iPhone SE (375px), iPhone 14 (390px), Pixel 7 (412px) |
| U-02 | La app funciona correctamente en: Safari iOS 16+, Chrome Android 10+, Chrome desktop, Firefox desktop | Test manual del flujo completo en cada navegador |
| U-03 | El registro completo (nombre + email + arquetipo + generación de monstruo) se completa en menos de 90 segundos | Test con 5 usuarios reales → cronometrar |
| U-04 | La app funciona como PWA: instalable en home screen, con splash screen y manifest configurado | Instalar desde Safari/Chrome → verificar icono, splash, modo standalone |
| U-05 | El lector QR solicita permiso de cámara con un mensaje claro que explica por qué se necesita | Primera apertura del lector → mensaje contextual visible antes del prompt del navegador |
| U-06 | Todas las acciones del usuario tienen feedback visual inmediato (< 300ms para feedback local) | Test manual de cada acción interactiva |
| U-07 | Los errores se muestran con mensajes comprensibles en español (no códigos técnicos) | Provocar errores comunes → verificar mensajes |
| U-08 | La identidad visual es coherente con la paleta definida (#232D4B, #E20074, #F5F340) y tipografía Poppins | Revisión visual completa de todas las pantallas |
| U-09 | La navegación principal permite acceder a cualquier sección en máximo 2 toques desde Home | Mapear flujos de navegación → verificar profundidad |
| U-10 | La app muestra un estado offline amigable si se pierde la conexión (no pantalla en blanco) | Desactivar red → verificar mensaje informativo |

---

## Resumen de criterios

| Categoría | Cantidad | Requisito para go-live |
|---|---|---|
| Funcional | 71 (F-01 a F-68 + F-39 actualizado, F-43b, F-43c, F-53b) | 100% cumplidos |
| Rendimiento | 8 (R-01 a R-08) | 90% cumplidos (mínimo 7 de 8) |
| Seguridad | 10 (S-01 a S-10) | 100% cumplidos |
| Operacional | 11 (O-01 a O-11) | 90% cumplidos (mínimo 10 de 11) |
| UX | 10 (U-01 a U-10) | 90% cumplidos (mínimo 9 de 10) |
| **TOTAL** | **110 criterios** | **Funcional + Seguridad: 100% · Resto: ≥ 90%** |

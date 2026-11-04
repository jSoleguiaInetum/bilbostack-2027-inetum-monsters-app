# B. Backlog Estructurado — BilboStack 2027 MVP

## Épica 1: Registro y Autenticación

**Descripción:** Permitir a los asistentes del evento crear una cuenta, autenticarse y acceder a la aplicación de forma segura desde dispositivos móviles.

**Criterios de aceptación:**
- Un usuario puede registrarse con nombre, email y contraseña
- Un usuario puede iniciar sesión con credenciales válidas
- Un usuario no registrado no puede acceder a ninguna pantalla protegida
- El email debe ser único en el sistema; intentar registrar un email existente muestra error descriptivo
- El token de sesión expira tras 24 horas de inactividad **[HIPÓTESIS: duración del evento + margen para revisar resultados al día siguiente]**
- El login funciona correctamente en Chrome, Safari y Firefox móvil

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E1-01 | Como asistente, quiero registrarme con mi nombre, email y contraseña, para crear mi cuenta en la app | M | P0 | — |
| E1-02 | Como asistente, quiero iniciar sesión con mi email y contraseña, para acceder a mi perfil y monstruo | S | P0 | E1-01 |
| E1-03 | Como sistema, quiero validar que el email sea único y tenga formato válido, para evitar cuentas duplicadas | S | P0 | E1-01 |
| E1-04 | Como asistente, quiero recuperar mi contraseña mediante email, para no perder acceso durante el evento | M | P1 | E1-01 |
| E1-05 | Como sistema, quiero emitir un JWT al autenticar al usuario, para mantener sesiones seguras sin estado en servidor | S | P0 | E1-02 |
| E1-06 | Como administrador, quiero poder desactivar la cuenta de un usuario, para gestionar incidencias durante el evento | S | P1 | E1-01 |

---

## Épica 2: Perfil Profesional y Onboarding

**Descripción:** Guiar al usuario tras el registro para que seleccione su arquetipo profesional y complete su perfil, configurando la base para la personalización de la experiencia.

**Criterios de aceptación:**
- El flujo de onboarding se muestra solo la primera vez tras el registro
- El usuario debe seleccionar exactamente un arquetipo de los 8 disponibles antes de continuar
- El perfil muestra: nombre, arquetipo, monstruo, Expertise, Aura Tech
- El arquetipo puede consultarse pero no modificarse después del onboarding
- El onboarding completo genera automáticamente el monstruo (vinculado a Épica 3)

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E2-01 | Como asistente, quiero ver un flujo de onboarding guiado tras mi registro, para entender la mecánica del juego | M | P0 | E1-01 |
| E2-02 | Como asistente, quiero seleccionar mi arquetipo profesional entre las 8 opciones disponibles, para personalizar mi experiencia | S | P0 | E2-01 |
| E2-03 | Como asistente, quiero ver mi perfil con mis datos, arquetipo, métricas y monstruo, para conocer mi estado actual | M | P0 | E2-02, E3-01 |
| E2-04 | Como sistema, quiero impedir el acceso al home hasta completar el onboarding, para garantizar que todos los usuarios tienen perfil y monstruo | S | P0 | E2-02 |

---

## Épica 3: Generación de Monstruos

**Descripción:** Generar una criatura tecnológica única para cada usuario a partir de su nombre, email y arquetipo profesional. La criatura es el avatar central de la experiencia gamificada.

**Criterios de aceptación:**
- El monstruo se genera automáticamente al completar el onboarding
- Dos usuarios distintos (nombre + email + arquetipo distintos) nunca obtienen el mismo monstruo
- El monstruo tiene: nombre, especie, aspecto visual, categoría inicial (Inusual/Singular/Único/Épico/Legendario)
- La distribución de categorías iniciales no da ventaja decisiva a ningún grupo **[HIPÓTESIS: distribución ~50% Inusual, 25% Singular, 15% Único, 8% Épico, 2% Legendario]**
- El monstruo es visible en la pantalla "Mi Monstruo" inmediatamente tras su generación
- Los valores iniciales de Expertise y Aura Tech se calculan según la especificación (1 + bonus)

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E3-01 | Como sistema, quiero generar un monstruo único a partir del hash de nombre + email + arquetipo, para garantizar unicidad determinista | L | P0 | E2-02 |
| E3-02 | Como asistente, quiero ver mi monstruo con su nombre, especie, categoría y aspecto visual en la pantalla "Mi Monstruo", para conocer a mi criatura | M | P0 | E3-01 |
| E3-03 | Como sistema, quiero asignar una categoría inicial al monstruo según el algoritmo de generación, para establecer la rareza base | M | P0 | E3-01 |
| E3-04 | Como sistema, quiero calcular los valores iniciales de Expertise (1 + bonus email) y Aura Tech (1 + bonus categoría), para establecer el punto de partida del jugador | S | P0 | E3-03 |
| E3-05 | Como asistente, quiero ver una animación o transición al recibir mi monstruo por primera vez, para que el momento de "nacimiento" sea memorable | M | P1 | E3-02 |
| E3-06 | Como sistema, quiero generar un set de atributos visuales (colores, forma, rasgos) derivados del hash, para componer la apariencia visual del monstruo **[HIPÓTESIS: generación por composición de assets prediseñados con variaciones de color/forma, no IA generativa en tiempo real]** | XL | P0 | E3-01 |

---

## Épica 4: Sistema de Métricas (Expertise + Aura Tech)

**Descripción:** Implementar el motor de cálculo y actualización de las dos métricas principales que determinan la progresión y evolución del jugador.

**Criterios de aceptación:**
- Expertise y Aura Tech se muestran siempre visibles en la UI (home, perfil, monstruo)
- Cada acción que modifica una métrica la actualiza en tiempo real en pantalla
- El historial de cambios en métricas se registra (qué acción, cuánto, cuándo)
- Los valores nunca pueden ser negativos
- La fórmula de cálculo de bonus iniciales es determinista y auditable

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E4-01 | Como sistema, quiero mantener un registro de Expertise y Aura Tech por usuario con historial de cambios, para calcular evoluciones y rankings | M | P0 | E3-04 |
| E4-02 | Como asistente, quiero ver mis métricas actualizadas en tiempo real tras cada acción, para entender mi progresión | S | P0 | E4-01 |
| E4-03 | Como sistema, quiero aplicar incrementos de métricas según una tabla de recompensas configurable por tipo de acción, para poder balancear el juego sin redesplegar | M | P0 | E4-01 |
| E4-04 | Como administrador, quiero modificar la tabla de recompensas de métricas desde el dashboard, para ajustar el balanceo durante el evento | M | P1 | E4-03, E11-01 |

---

## Épica 5: Sistema de Preguntas

**Descripción:** Gestionar un banco de preguntas con tres categorías (universales, especializadas por rol, crossover) que se sirven durante combates y retos, impactando en métricas y progresión.

**Criterios de aceptación:**
- Existen al menos 3 tipos de preguntas: universales, especializadas por arquetipo, crossover
- Cada pregunta tiene: enunciado, opciones de respuesta, respuesta correcta, dificultad, tipo, arquetipo asociado (si aplica), recompensas (Expertise, Aura Tech)
- Las preguntas en combate se seleccionan adaptándose a los arquetipos de ambos combatientes
- Una pregunta respondida correctamente otorga las recompensas configuradas
- El banco de preguntas es administrable desde el dashboard
- **[HIPÓTESIS: mínimo 200 preguntas para MVP — suficiente para ~500 asistentes sin repetición excesiva en combates]**

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E5-01 | Como sistema, quiero almacenar un banco de preguntas con tipo, dificultad, arquetipo, opciones y respuesta correcta, para servir preguntas en combates y retos | M | P0 | — |
| E5-02 | Como sistema, quiero seleccionar una pregunta del arquetipo de cada combatiente por ronda (o universal si comparten arquetipo), para que cada jugador responda sobre su campo y el combate sea justo | L | P0 | E5-01 |
| E5-03 | Como asistente, quiero responder preguntas de opción múltiple con feedback inmediato (correcto/incorrecto), para saber cómo me fue | S | P0 | E5-01 |
| E5-04 | Como sistema, quiero evitar repetir preguntas ya respondidas por un usuario en la misma sesión, para mantener la experiencia fresca | M | P0 | E5-01 |
| E5-05 | Como administrador, quiero crear, editar y eliminar preguntas desde el dashboard, para gestionar el contenido del juego | L | P0 | E5-01, E11-01 |
| E5-06 | Como administrador, quiero importar preguntas en bulk desde un CSV/JSON, para cargar el banco de preguntas inicial eficientemente | M | P1 | E5-05 |

---

## Épica 6: Sistema QR

**Descripción:** Implementar la generación de códigos QR personales y el escaneo de códigos QR como mecanismo central de interacción entre participantes y con elementos del evento.

**Criterios de aceptación:**
- Cada usuario tiene un QR personal único visible en la pantalla "QR Personal"
- El QR codifica un identificador único del usuario (no datos personales en claro)
- El lector QR integrado en la app puede escanear QR de tipo: Persona, Charla, NPC, Misión, Objeto, Evento
- Tras escanear un QR de Persona, el usuario puede elegir: Combatir (añade contacto automáticamente + inicia combate) o Añadir contacto (solo contacto, sin combate)
- Tras escanear un QR de Charla, se registra check-in y se otorga +Aura Tech
- El QR personal se muestra con brillo máximo y tamaño grande para facilitar el escaneo en condiciones de conferencia **[HIPÓTESIS: salas con iluminación variable]**

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E6-01 | Como sistema, quiero generar un código QR único por usuario que codifique su ID de forma segura, para identificación durante el evento | M | P0 | E1-01 |
| E6-02 | Como asistente, quiero ver mi QR personal en pantalla completa con brillo alto, para que otros puedan escanearme fácilmente | S | P0 | E6-01 |
| E6-03 | Como asistente, quiero escanear el QR de otro participante y elegir entre combatir o añadir contacto, para interactuar con otros asistentes | L | P0 | E6-01 |
| E6-04 | Como asistente, quiero escanear un QR de Charla para hacer check-in y recibir +Aura Tech, para registrar mi asistencia a sesiones | M | P0 | E6-01, E4-01 |
| E6-05 | Como sistema, quiero validar el tipo de QR escaneado y redirigir al flujo correspondiente (combate, contacto, check-in, etc.), para gestionar las distintas interacciones | M | P0 | E6-03 |
| E6-06 | Como administrador, quiero generar QR de tipo Charla, NPC, Objeto y Evento desde el dashboard, para distribuirlos físicamente en el evento | L | P0 | E6-01, E11-01 |
| E6-07 | Como sistema, quiero registrar cada escaneo con timestamp y tipo para prevenir abusos (escaneos duplicados en ventana corta), para mantener la integridad del juego | S | P0 | E6-05 |

---

## Épica 7: Combates

**Descripción:** Implementar el sistema de combate entre dos participantes: un enfrentamiento rápido (< 60s) basado en preguntas, que recompensa a ambos jugadores y fomenta el networking.

**Criterios de aceptación:**
- Un combate se inicia escaneando el QR de otro participante y seleccionando "Combatir"
- Dos participantes solo pueden combatir entre sí UNA vez durante todo el evento
- Si ya combatieron, el sistema muestra un mensaje y sugiere añadir como contacto
- El combate consiste en mejor de 3 rondas con cuenta atrás por pregunta **[HIPÓTESIS: 10 segundos por pregunta]**
- En cada ronda, cada jugador recibe una pregunta de su propio arquetipo (o universal si ambos comparten arquetipo). El resultado de la ronda se determina por: acierto > fallo; a igualdad de acierto, gana el más rápido
- Si ambos fallan, la ronda queda nula y se juega una ronda adicional (máximo 1 ronda extra)
- El desempate global se resuelve por tiempo de respuesta acumulado en rondas ganadas
- Si persiste el empate, hay una ronda de muerte súbita con pregunta crossover (misma pregunta para ambos)
- Al finalizar, ambos jugadores reciben recompensas de métricas (el ganador más que el perdedor, pero ambos ganan)
- El combate completo dura menos de 60 segundos
- El historial de combates se registra con resultado, preguntas y tiempos

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E7-01 | Como asistente, quiero iniciar un combate al escanear el QR de otro participante y seleccionar "Combatir", para retar a otro asistente | M | P0 | E6-03 |
| E7-02 | Como sistema, quiero verificar que dos participantes no han combatido previamente antes de iniciar el combate, para forzar diversidad de oponentes | S | P0 | E7-01 |
| E7-03 | Como asistente, quiero ver una pantalla de presentación con ambos monstruos antes de empezar el combate, para crear anticipación | M | P0 | E7-01, E3-02 |
| E7-04 | Como asistente, quiero responder preguntas de mi propio arquetipo con cuenta atrás de 10 segundos mientras mi oponente responde las suyas, para que el combate sea justo para ambos perfiles | L | P0 | E7-01, E5-02 |
| E7-05 | Como sistema, quiero resolver cada ronda comparando acierto (acierto > fallo) y velocidad (a igualdad), y el combate global por mejor de 3, con muerte súbita crossover si hay empate, para garantizar un resultado justo | M | P0 | E7-04 |
| E7-06 | Como sistema, quiero otorgar recompensas de Expertise y Aura Tech a ambos combatientes (más al ganador), para que combatir siempre sea beneficioso | S | P0 | E7-04, E4-03 |
| E7-07 | Como asistente, quiero ver una pantalla de resultado con el ganador y recompensas obtenidas, para cerrar el combate (el oponente se añade automáticamente como contacto al iniciar el combate) | M | P0 | E7-06, E8-01 |
| E7-08 | Como sistema, quiero sincronizar el estado del combate en tiempo real entre ambos dispositivos, para que la experiencia sea simultánea **[HIPÓTESIS: WebSocket con fallback a polling corto]** | XL | P0 | E7-04 |

---

## Épica 8: Contactos

**Descripción:** Permitir a los usuarios construir una red de contactos durante el evento, incentivando la diversidad de perfiles como factor de progresión.

**Criterios de aceptación:**
- Un contacto se añade escaneando el QR de otro participante y seleccionando "Añadir contacto"
- Añadir contacto es unidireccional (no requiere aceptación digital): el acto de mostrar el QR a otra persona constituye aceptación tácita de la interacción
- Añadir un contacto otorga +Aura Tech
- Contactos de arquetipos distintos al propio otorgan bonus adicional de Aura Tech (diversidad > cantidad)
- La lista de contactos muestra: nombre, arquetipo, monstruo, momento de conexión e icono de origen (🤝 contacto directo | ⚔️ combate + resultado: 👑 victoria, 💀 derrota, 🤗 empate)
- No se puede añadir al mismo contacto dos veces

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E8-01 | Como asistente, quiero añadir a otro participante como contacto escaneando su QR, para construir mi red durante el evento | S | P0 | E6-03 |
| E8-02 | Como sistema, quiero otorgar +Aura Tech al añadir un contacto, con bonus extra si el contacto tiene un arquetipo diferente al mío, para incentivar la diversidad | S | P0 | E8-01, E4-03 |
| E8-03 | Como asistente, quiero ver mi lista de contactos con nombre, arquetipo, monstruo e icono de origen (🤝 contacto directo, ⚔️👑 combate ganado, ⚔️💀 combate perdido, ⚔️🤗 combate empatado), para revisar a quién he conocido y cómo | M | P0 | E8-01 |
| E8-04 | Como sistema, quiero impedir añadir el mismo contacto dos veces y mostrar un mensaje informativo, para evitar abuso de métricas | XS | P0 | E8-01 |

---

## Épica 9: Logros

**Descripción:** Implementar un sistema de logros que reconozca hitos del evento y recompense comportamientos deseados (networking, participación, exploración).

**Criterios de aceptación:**
- Cada logro tiene: nombre, descripción, icono, condición de desbloqueo, recompensa (mínimo +1 Aura Tech)
- Los logros se desbloquean automáticamente al cumplir su condición
- Al desbloquear un logro, el usuario recibe una notificación en la app
- Los logros visibles se muestran en la pantalla "Logros" en dos estados: desbloqueados (detalle completo) y pendientes (nombre + pista de cómo conseguirlo)
- Los logros ocultos no aparecen en la lista hasta que se desbloquean, momento en que se revelan con notificación especial de descubrimiento
- Los logros pueden otorgar además: objetos, Expertise, títulos
- **[HIPÓTESIS: 15-25 logros para MVP, cubriendo las principales actividades del evento]**

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E9-01 | Como sistema, quiero evaluar las condiciones de desbloqueo de logros tras cada acción del usuario, para otorgar logros automáticamente | L | P0 | E4-01 |
| E9-02 | Como asistente, quiero recibir una notificación visual cuando desbloqueo un logro, para sentir el impacto de mis acciones | M | P0 | E9-01 |
| E9-03 | Como asistente, quiero ver los logros visibles (desbloqueados con detalle, pendientes con pista) y que los logros ocultos solo aparezcan al desbloquearlos, para tener objetivos claros y sorpresas por descubrir | M | P0 | E9-01 |
| E9-04 | Como sistema, quiero otorgar las recompensas asociadas al logro (Aura Tech, Expertise, objetos, títulos) al desbloquearlo, para impactar la progresión del jugador | S | P0 | E9-01, E4-03 |
| E9-05 | Como administrador, quiero crear, editar y desactivar logros desde el dashboard, para gestionar los hitos del evento | L | P0 | E11-01 |

---

## Épica 10: Evolución de Monstruos

**Descripción:** Implementar el sistema de evolución visual del monstruo basado en las métricas acumuladas del jugador, con un máximo de 3 evoluciones durante el evento.

**Criterios de aceptación:**
- El monstruo puede evolucionar un máximo de 3 veces
- Las evoluciones se activan al alcanzar umbrales definidos de Expertise + Aura Tech
- Al evolucionar, el aspecto visual del monstruo cambia de forma perceptible
- El usuario recibe una notificación/animación al evolucionar
- Las evoluciones pasadas se registran en el historial del monstruo
- Los umbrales de evolución son configurables desde el dashboard
- **[HIPÓTESIS: umbrales basados en percentiles de progresión esperada para un evento de 8 horas con ~500 asistentes]**

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E10-01 | Como sistema, quiero evaluar si un monstruo debe evolucionar cada vez que cambian las métricas del usuario, para activar evoluciones en tiempo real | M | P0 | E4-01, E3-01 |
| E10-02 | Como asistente, quiero ver una animación o transición cuando mi monstruo evoluciona, para que sea un momento memorable | L | P1 | E10-01 |
| E10-03 | Como sistema, quiero cambiar los atributos visuales del monstruo al evolucionar (nuevos rasgos, colores más intensos, mayor complejidad), para que la evolución sea visualmente evidente | L | P0 | E10-01, E3-06 |
| E10-04 | Como asistente, quiero ver el historial de evoluciones de mi monstruo con el aspecto anterior y la fecha/hora de cada evolución, para revisar mi progresión | M | P1 | E10-01 |
| E10-05 | Como administrador, quiero configurar los umbrales de evolución (valores de Expertise + Aura Tech requeridos), para balancear la progresión | S | P0 | E10-01, E11-01 |

---

## Épica 11: Dashboard Privado (Administración)

**Descripción:** Panel de administración para que la organización del evento gestione todos los elementos del juego: usuarios, roles, preguntas, logros, QR, objetos y estadísticas.

**Criterios de aceptación:**
- Solo usuarios con rol Administrador u Organización pueden acceder
- CRUD completo para: usuarios, roles, logros, objetos, QR, preguntas
- Vista de estadísticas en tiempo real: usuarios registrados, combates, contactos, logros desbloqueados
- Capacidad de asignar/modificar roles de usuario
- Capacidad de generar y descargar QR para charlas, NPCs y objetos
- Búsqueda y filtrado en todas las listas

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E11-01 | Como administrador, quiero acceder a un panel protegido con navegación a todas las secciones de gestión, para administrar el evento | L | P0 | E1-05 |
| E11-02 | Como administrador, quiero ver la lista de usuarios registrados con filtros por rol y arquetipo, para monitorear la participación | M | P0 | E11-01 |
| E11-03 | Como administrador, quiero asignar y modificar roles (Participante, Ponente, Patrocinador, NPC, Organización) a cualquier usuario, para gestionar permisos | M | P0 | E11-01 |
| E11-04 | Como administrador, quiero ver un dashboard de estadísticas en tiempo real (registros, combates, contactos, logros, métricas promedio), para monitorear el evento | L | P0 | E11-01 |
| E11-05 | Como administrador, quiero gestionar (CRUD) los objetos del inventario con nombre, descripción, rareza y beneficio, para configurar las recompensas | M | P1 | E11-01 |
| E11-06 | Como administrador, quiero generar y descargar QR imprimibles para charlas, NPCs y objetos, para distribuirlos físicamente | M | P0 | E11-01, E6-06 |

---

## Épica 12: Rankings y Dashboard Público

**Descripción:** Pantalla pública visible para todos los asistentes con clasificaciones en tiempo real y estadísticas agregadas del evento, diseñada también para proyección en pantallas del venue.

**Criterios de aceptación:**
- Rankings visibles: Más Aura Tech, Más Expertise, Más Contactos, Más Victorias
- Los rankings se actualizan en tiempo real (o con refresh máximo de 30 segundos)
- Estadísticas globales: total combates, total contactos, total logros desbloqueados
- Sección de evoluciones recientes (feed de las últimas evoluciones)
- La vista pública no requiere autenticación
- Diseño responsive apto para proyección en pantalla grande del venue **[HIPÓTESIS: se proyectará en pantallas del evento]**

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E12-01 | Como asistente, quiero ver el ranking de Aura Tech, Expertise, Contactos y Victorias, para saber cómo me posiciono respecto al resto | M | P0 | E4-01 |
| E12-02 | Como asistente, quiero ver estadísticas globales del evento (combates totales, contactos, logros), para entender la actividad general | S | P0 | E11-04 |
| E12-03 | Como asistente, quiero ver un feed de evoluciones recientes de otros participantes, para descubrir qué está pasando en el evento | M | P1 | E10-01 |
| E12-04 | Como sistema, quiero actualizar los rankings cada 30 segundos máximo, para mostrar datos casi en tiempo real | S | P0 | E12-01 |
| E12-05 | Como organización, quiero una vista de rankings adaptada a pantalla grande sin autenticación, para proyectarla en el venue | M | P1 | E12-01 |

---

## Épica 13: Experiencia Social y Compartición

**Descripción:** Permitir a los usuarios generar y compartir contenido visual de su experiencia (monstruo, logros, estadísticas) en redes sociales, especialmente LinkedIn.

**Criterios de aceptación:**
- El usuario puede generar una "tarjeta final" con su monstruo, métricas, logros destacados y estadísticas
- La tarjeta se genera como imagen descargable y/o con URL compartible
- Los logros individuales son compartibles con imagen + texto predefinido
- Las evoluciones son compartibles con imagen del antes/después
- El contenido compartido incluye branding de Inetum y BilboStack 2027
- Las URLs compartidas muestran Open Graph meta tags para preview en LinkedIn/Twitter

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E13-01 | Como asistente, quiero generar una tarjeta visual final con mi monstruo, métricas y logros, para compartir mi experiencia en redes | L | P0 | E3-02, E4-01, E9-01 |
| E13-02 | Como asistente, quiero compartir un logro individual con imagen y texto en LinkedIn/Twitter, para mostrar mis hitos | M | P1 | E9-01 |
| E13-03 | Como asistente, quiero compartir la evolución de mi monstruo con imagen antes/después, para mostrar mi progresión | M | P1 | E10-01 |
| E13-04 | Como sistema, quiero servir Open Graph meta tags en las URLs compartidas, para que los previews se muestren correctamente en redes sociales | M | P0 | E13-01 |

---

## Épica 14: Home y Navegación

**Descripción:** Pantalla principal post-onboarding que sirve como hub de navegación y muestra el estado actual del jugador de un vistazo.

**Criterios de aceptación:**
- El home muestra: monstruo actual, Expertise, Aura Tech, logros recientes, próxima evolución (progreso hacia el umbral)
- Navegación accesible a todas las pantallas principales (Mi Monstruo, QR, Lector QR, Contactos, Logros, Inventario, Rankings)
- La app funciona como PWA accesible desde el navegador móvil sin necesidad de instalación desde store **[HIPÓTESIS: PWA para evitar el ciclo de aprobación de app stores y facilitar acceso inmediato el día del evento]**

| ID | Historia de usuario | Talla | Prioridad | Dependencias |
|---|---|---|---|---|
| E14-01 | Como asistente, quiero ver un resumen de mi estado (monstruo, métricas, logros recientes) en la pantalla principal, para orientarme rápidamente | M | P0 | E3-02, E4-01, E9-01 |
| E14-02 | Como asistente, quiero navegar desde el home a cualquier sección de la app con máximo 1 tap, para acceder rápido durante el evento | M | P0 | E14-01 |
| E14-03 | Como sistema, quiero que la app funcione como PWA instalable desde el navegador, para que los asistentes la usen sin descargar desde app store | L | P0 | — |

---

## Resumen de Épicas y Estimación Agregada

| # | Épica | Historias | Talla total estimada | Dependencias clave |
|---|---|---|---|---|
| E1 | Registro y Autenticación | 6 | M-L | — |
| E2 | Perfil Profesional y Onboarding | 4 | M | E1 |
| E3 | Generación de Monstruos | 6 | XL | E2 |
| E4 | Sistema de Métricas | 4 | M-L | E3 |
| E5 | Sistema de Preguntas | 6 | L-XL | — |
| E6 | Sistema QR | 7 | L-XL | E1 |
| E7 | Combates | 8 | XL | E5, E6 |
| E8 | Contactos | 4 | S-M | E6 |
| E9 | Logros | 5 | L | E4 |
| E10 | Evolución de Monstruos | 5 | L-XL | E3, E4 |
| E11 | Dashboard Privado | 6 | L-XL | E1 |
| E12 | Rankings y Dashboard Público | 5 | M-L | E4 |
| E13 | Experiencia Social | 4 | L | E3, E9, E10 |
| E14 | Home y Navegación | 3 | L | E3, E4, E9 |

**Total: 14 épicas, 73 historias de usuario**

---

## Mapa de Dependencias entre Épicas

```
E1 (Auth) ─────────┬──────────────────────────────────────── E11 (Dashboard Privado)
                    │
                    ├── E2 (Perfil/Onboarding)
                    │     │
                    │     └── E3 (Monstruos) ──────┬──────── E10 (Evolución)
                    │                              │              │
                    │                              ├──────── E13 (Social)
                    │                              │
                    │                              └── E4 (Métricas) ──┬── E9 (Logros)
                    │                                                  │
                    │                                                  ├── E12 (Rankings)
                    │                                                  │
                    │                                                  └── E14 (Home)
                    │
                    └── E6 (QR) ───────────┬──────── E7 (Combates)
                                           │
                                           └──────── E8 (Contactos)

E5 (Preguntas) ────────────────────────────────────── E7 (Combates)
```

---

## Orden de Implementación Recomendado (Camino Crítico)

| Fase | Épicas | Justificación |
|---|---|---|
| **Sprint 1** | E1 (Auth) + E14-03 (PWA) + E5 (Preguntas — backend) | Fundamentos: sin auth no hay nada; preguntas son independientes y bloquean combates |
| **Sprint 2** | E2 (Onboarding) + E3 (Monstruos) + E6 (QR) | Tres pilares paralelos: perfil, criatura y mecanismo de interacción |
| **Sprint 3** | E4 (Métricas) + E7 (Combates) + E8 (Contactos) | Core loop del juego: combatir, conectar, progresar |
| **Sprint 4** | E9 (Logros) + E10 (Evolución) + E11 (Dashboard Privado) | Recompensas, progresión visible y herramientas de gestión |
| **Sprint 5** | E12 (Rankings) + E13 (Social) + E14 (Home) | Capas de presentación, compartición y pulido final |

**[HIPÓTESIS: sprints de 2 semanas con equipo de 3-4 desarrolladores full-stack. Total estimado: 10 semanas de desarrollo]**

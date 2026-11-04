# Stories de desarrollo — Fase 1 MVP

Ejecutar en orden. Cada story es autocontenida: incluye archivos a crear/modificar, código exacto de referencia, y criterios de aceptación verificables.

## Orden de ejecución

1. `story-01-setup.md` — Scaffold del proyecto
2. `story-02-types.md` — Tipos y constantes compartidas
3. `story-03-monster-generator.md` — Lógica de generación SHA-256 → params
4. `story-04-monster-card.md` — Componente visual MonsterCard
5. `story-05-auth.md` — Auth mock + contexto + rutas protegidas
6. `story-06-pages-auth.md` — Login, Register, selección de arquetipo
7. `story-07-my-monster.md` — Página Mi Monstruo + QR display
8. `story-08-qr-scanner.md` — Escáner QR con cámara
9. `story-09-post-scan.md` — Página post-scan con tarjeta del otro
10. `story-10-polish.md` — Layout, navegación, responsive, loading states

## Instrucciones para el agente de código

- El repo de la app es NUEVO, separado de sp-homevisit-api
- Los SVG assets están en `plan/App/monster-assets/` y se copian a `public/monster-assets/`
- Usar modelo económico (Sonnet) para ejecutar cada story
- Cada story indica qué archivos crear y con qué contenido
- No saltarse stories ni reordenar — hay dependencias

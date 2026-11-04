# Stories de desarrollo — Fase 2 Interacción Social

Ejecutar en orden. Cada story se construye sobre la Fase 1 MVP completada.

## Orden de ejecución

1. `story-11-metrics.md` — Sistema de métricas (Expertise + Aura Tech)
2. `story-12-contacts-page.md` — Página de contactos con lista completa
3. `story-13-evolution.md` — Sistema de evolución visual del monstruo
4. `story-14-questions.md` — Banco de preguntas mock
5. `story-15-battle.md` — Sistema de combate completo
6. `story-16-achievements.md` — Sistema de logros
7. `story-17-talk-checkin.md` — QR de charlas + check-in
8. `story-18-home.md` — Página Home con resumen del jugador
9. `story-19-polish.md` — Polish final de Fase 2

## Dependencias

```
Story 11 (Métricas) ──┬── Story 12 (Contactos) ──→ Story 15 (Combates)
                      ├── Story 13 (Evolución)
                      ├── Story 14 (Preguntas) ──→ Story 15 (Combates)
                      ├── Story 16 (Logros)
                      └── Story 17 (Check-in charlas)
                      
Story 18 (Home) depende de: 11, 12, 13, 16
Story 19 (Polish) depende de todo lo anterior
```

## Notas técnicas

- Todo sigue con mock localStorage hasta integración de backend
- El motor de combate es local (sin WebSocket) — el oponente "responde" con lógica simulada
- Las métricas se persisten en localStorage junto con el perfil del usuario
- Los logros se evalúan en el cliente tras cada acción que modifica métricas

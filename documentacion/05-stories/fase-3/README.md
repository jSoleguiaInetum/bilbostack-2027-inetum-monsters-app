# Stories de desarrollo — Fase 3 Rankings, Dashboards y Social

Estado: **iniciada**. La Fase 3 se apoya en la capa `src/data` y debe funcionar en modo `local` (mock) y `api` sin cambiar la UI.

## Orden de ejecución

| # | Story | Épica | Estado |
|---|---|---|---|
| 20 | RankingsRepository | E12 | ✅ |
| 21 | Página de rankings | E12 | ✅ |
| 22 | Dashboard público | E12 | ✅ |
| 23 | Roles y guard de administración | E11 | ✅ |
| 24 | Dashboard privado | E11 | ✅ |
| 25 | Inventario de objetos | E11/E13 | ✅ |
| — | Feature flags (gestión en `/admin`) | E11 | ✅ |
| 26 | Misiones base | E11/E13 | ✅ |
| 27 | Tarjetas compartibles y OG | E13 | Parcial (OG dinámico pendiente) |
| 28 | Home real y navegación 1 tap | E14 | Pendiente |

## Dependencias

```
Story 20 (RankingsRepository)
  └── Story 21 (Rankings UI)
        └── Story 22 (Dashboard público)

Story 23 (Roles/admin)
  └── Story 24 (Dashboard privado)
        ├── Story 25 (Inventario)
        └── Story 26 (Misiones)

Story 27 (Share/OG) depende de 21; el OG dinámico y la URL pública requieren backend o prerender
Story 28 (Home) depende de 20, 21, 25 y 26
```

## Criterios transversales

- Ningún componente accede a `localStorage` ni a `fetch`: todo pasa por `src/data`.
- Cada puerto nuevo necesita adaptador `local`, adaptador `api` y tests.
- Los endpoints públicos no exponen email ni datos privados.
- Los rankings se actualizan como máximo cada 30 segundos.
- La UI debe funcionar a 375px y en pantalla grande para el venue.
- PWA, carga y despliegue pertenecen a Fase 4.

## Notas de arquitectura

- `Ranking` es un modelo de lectura: se calcula desde usuarios, métricas, contactos y combates.
- En modo `local`, los rankings se agregan en el navegador a partir de los datos mock.
- En modo `api`, el backend devuelve el top y la posición del usuario actual.
- La posición propia se devuelve aunque el usuario quede fuera del top solicitado.
- `User` incluye `role`; los adaptadores normalizan roles ausentes o desconocidos a `participant`.
- El panel `/admin` acepta el rol `admin`. En modo `local`, el primer usuario registrado es admin para poder probarlo.
- `DashboardRepository.getAdminOverview` agrega totales del evento y medias de Expertise/Aura; no expone email en rankings públicos.
- `UserRepository.updateRole` actualiza el rol en modo `local`/`api`; en `local` también refresca la sesión si el usuario se cambia a sí mismo.
- Los feature flags son globales (no por usuario), viven detrás de `FeatureFlagsRepository` y se gestionan desde `/admin`. `inventory` y `missions` arrancan apagados: ocultan el acceso en Mi Criatura y bloquean sus rutas hasta que un admin los habilite. En modo `local` persisten en `bilbostack_feature_flags`; en modo `api`, en `GET/PATCH /feature-flags`.
- Las misiones base son automáticas: 7 definiciones en `src/lib/missions.ts`, objetivo declarativo (`contacts`, `battles`, `battle_wins`, `talks`, `archetypes`, `achievements`, `expertise`, `aura`) y recompensa de métricas/objeto. `MissionsRepository.checkAndComplete` evalúa y aplica recompensas y objetos de forma idempotente. En `local` solo se guardan las completaciones (`bilbostack_missions_<userId>`); en `api`, el backend devuelve el progreso y aplica las recompensas en `POST /users/:id/missions/check`.
- La evaluación de misiones se dispara desde `MetricsProvider` después de cada recompensa y en `refreshMetrics`, solo con el flag `missions` activo. El historial de métricas registra `mission_complete`.
- Las tarjetas compartibles se generan en cliente con canvas (`src/lib/share-card.ts` y `share-card-canvas.ts`), sin backend: monstruo, métricas, evolución, logros y branding, con descarga PNG y enlaces a LinkedIn/X. Los OG estáticos viven en `index.html`; los OG dinámicos por tarjeta requieren backend o prerender.

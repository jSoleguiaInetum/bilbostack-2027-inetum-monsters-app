# Story 22 — Dashboard público

**Estado:** ✅ implementada

## Objetivo

Ofrecer una vista pública, sin autenticación, con los cuatro rankings, estadísticas globales del evento y las evoluciones recientes. Debe refrescarse cada 30 segundos y funcionar tanto en móvil como proyectada en una pantalla grande del venue.

## Dependencias

- Story 20 (`RankingsRepository`).
- Story 21 (página de rankings y refresco cada 30 s).
- Capa `src/data` con puertos y adaptadores `local`/`api`.

## Contrato de dominio

```typescript
export interface DashboardStats {
  totalUsers: number
  totalBattles: number
  totalContacts: number
  totalAchievements: number
}

export interface RecentEvolution {
  userId: string
  name: string
  archetype: Archetype
  stage: Evolution
  totalPoints: number
  evolvedAt: string
}

export interface PublicDashboard {
  stats: DashboardStats
  rankings: Record<RankingCategory, RankingEntry[]>
  recentEvolutions: RecentEvolution[]
}

export interface DashboardOptions {
  rankingsLimit?: number
  evolutionsLimit?: number
}

export interface DashboardRepository {
  getOverview(options?: DashboardOptions): Promise<PublicDashboard>
}
```

Reglas:

- Un único método (`getOverview`) devuelve todo lo que necesita la vista pública para minimizar peticiones en el venue.
- `rankingsLimit` por defecto: 5. `evolutionsLimit` por defecto: 10.
- Los rankings se delegan en `RankingsRepository`; no se duplica el cálculo.
- Las evoluciones recientes se derivan del historial de métricas: se busca el último cruce de umbral (0/20/60/120) de cada usuario.
- Se ordenan por `evolvedAt` descendente y se desempatan por `userId`.
- No se expone `email` ni datos privados (S-08).

## Adaptador local

Agrega usuarios, métricas, contactos, combates y logros del `localStorage`:

| Dato | Fuente |
|---|---|
| `totalUsers` | `users.length` |
| `totalBattles` | suma de combates de todos los usuarios |
| `totalContacts` | suma de contactos de todos los usuarios |
| `totalAchievements` | suma de logros desbloqueados |
| `recentEvolutions` | historial de métricas y umbrales de evolución |
| `rankings` | `localRankingsRepository` (4 categorías) |

## Adaptador API

```
GET /dashboard/public?rankingsLimit=5&evolutionsLimit=10
```

Respuesta:

```json
{
  "stats": {
    "totalUsers": 120,
    "totalBattles": 340,
    "totalContacts": 210,
    "totalAchievements": 560
  },
  "rankings": {
    "aura": [{ "rank": 1, "userId": "u1", "name": "Alice", "archetype": "developer", "score": 16 }],
    "expertise": [],
    "contacts": [],
    "wins": []
  },
  "recentEvolutions": [
    { "userId": "u1", "name": "Alice", "archetype": "developer", "stage": 2, "totalPoints": 65, "evolvedAt": "2026-01-01T12:20:00.000Z" }
  ]
}
```

Las categorías ausentes se mapean a listas vacías.

## UI

Ruta pública `/dashboard` (sin `ProtectedRoute` ni `Layout`):

- Cabecera con marca y badge "EN VIVO · 30 s".
- Cuatro tarjetas de estadísticas: participantes, combates, contactos y logros.
- Cuatro paneles de ranking (Aura Tech, Expertise, Contactos, Victorias) con top 5.
- Feed de evoluciones recientes con estadio, puntos y hora.
- Enlace "Ver dashboard público" desde el login.
- Refresco cada 30 segundos; en error durante un refresco se mantienen los últimos datos.
- Error inicial con botón "Reintentar".
- Responsive: 2 columnas de stats en móvil, 4 en desktop; rankings en 1/2/4 columnas según ancho.

## Archivos

- `src/lib/dashboard.ts` — tipos de dominio.
- `src/lib/evolution.ts` — helper `getEvolutionStageFromTotal`.
- `src/data/ports/dashboard-repository.ts` — puerto.
- `src/data/ports/index.ts` — alta en `Repositories`.
- `src/data/types.ts` — reexportación de tipos.
- `src/data/local/dashboard-repository.ts` — adaptador local.
- `src/data/local/index.ts` — alta en `localRepositories`.
- `src/data/api/dashboard-repository.ts` — adaptador HTTP.
- `src/data/api/dto.ts` — `DashboardDto` y mapper.
- `src/data/api/index.ts` — alta en `apiRepositories`.
- `src/pages/PublicDashboardPage.tsx` — vista pública.
- `src/pages/PublicDashboardPage.test.tsx` — tests de render, polling y reintento.
- `src/App.tsx` — ruta pública `/dashboard`.
- `src/pages/LoginPage.tsx` — enlace al dashboard.
- `src/data/local/local-repositories.test.ts` — tests de agregación.
- `src/data/api/api-repositories.test.ts` — test del contrato HTTP.
- `src/data/index.test.ts` — composición en ambos modos.

## Criterios de aceptación

- [x] El dashboard público es accesible sin autenticación (F-62).
- [x] Muestra los 4 rankings, estadísticas globales y evoluciones recientes (F-63).
- [x] Se actualiza automáticamente cada 30 segundos sin recargar (F-64).
- [x] No expone email ni datos privados (S-08).
- [x] `rankingsLimit` y `evolutionsLimit` configurables y con valores por defecto.
- [x] Estados de carga, vacío y error con reintento.
- [x] Responsive a 375px y apto para pantalla grande.
- [x] `lint`, `tsc` y la suite pasan.

## Fuera de alcance

- Dashboard privado de administración (Story 24).
- Roles y guard de administración (Story 23).
- Tiempo real por WebSocket; se usa polling.
- Normalización de rankings por arquetipo.
- Modo contingencia de solo lectura (Operaciones).

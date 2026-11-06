# Story 20 — RankingsRepository

**Estado:** ✅ implementada

## Objetivo

Añadir el puerto `RankingsRepository` con cuatro categorías (`expertise`, `aura`, `contacts`, `wins`), adaptador `local`, adaptador `api` y tests, sin tocar todavía la UI.

## Dependencias

- Fase 1 y 2 completadas.
- Capa `src/data` con puertos y adaptadores `local`/`api`.
- `UserRepository`, `MetricsRepository`, `ContactsRepository` y `BattlesRepository`.

## Contrato de dominio

```typescript
export type RankingCategory = 'expertise' | 'aura' | 'contacts' | 'wins'

export interface RankingEntry {
  rank: number
  userId: string
  name: string
  archetype: Archetype
  score: number
}

export interface Ranking {
  category: RankingCategory
  entries: RankingEntry[]
  currentUser: RankingEntry | null
}

export interface RankingOptions {
  limit?: number
  currentUserId?: string
}

export interface RankingsRepository {
  getByCategory(category: RankingCategory, options?: RankingOptions): Promise<Ranking>
}
```

Reglas:

- `limit` por defecto: 20.
- `entries` ordenadas por `score` descendente.
- Desempate determinista: nombre ascendente y luego `userId`.
- `currentUser` se busca en la clasificación completa, no solo en el top devuelto.
- No se expone `email` en ninguna entrada.

## Adaptador local

Agrega los datos mock de todos los usuarios registrados:

| Categoría | Fuente |
|---|---|
| `expertise` | `metrics.expertise` |
| `aura` | `metrics.auraTech` |
| `contacts` | longitud de contactos del usuario |
| `wins` | combates con `outcome === 'win'` |

## Adaptador API

```
GET /rankings?category=expertise&limit=20&userId=<opcional>
```

Respuesta:

```json
{
  "category": "expertise",
  "entries": [
    { "rank": 1, "userId": "u1", "name": "Alice", "archetype": "developer", "score": 11 }
  ],
  "currentUser": {
    "rank": 3, "userId": "u3", "name": "Carla", "archetype": "qa", "score": 10
  }
}
```

`userId` solo se envía cuando la UI pide la posición del jugador actual. El backend puede ignorarlo si resuelve la sesión por cookie.

## Archivos

- `src/lib/rankings.ts` — tipos de dominio.
- `src/data/ports/rankings-repository.ts` — puerto.
- `src/data/ports/index.ts` — alta en `Repositories`.
- `src/data/types.ts` — reexportación de tipos.
- `src/data/local/rankings-repository.ts` — adaptador local.
- `src/data/local/index.ts` — alta en `localRepositories`.
- `src/data/api/rankings-repository.ts` — adaptador HTTP.
- `src/data/api/dto.ts` — `RankingDto` y mapper.
- `src/data/api/index.ts` — alta en `apiRepositories`.
- `src/data/local/local-repositories.test.ts` — tests del cálculo local.
- `src/data/api/api-repositories.test.ts` — test del contrato HTTP.
- `src/data/index.test.ts` — composición en ambos modos.

## Criterios de aceptación

- [x] Existen las cuatro categorías.
- [x] El adaptador local agrega usuarios, métricas, contactos y victorias.
- [x] El top se ordena por score y desempata de forma determinista.
- [x] `limit` por defecto es 20.
- [x] `currentUser` incluye la posición real aunque quede fuera del top.
- [x] El adaptador API mapea la respuesta y envía `category`, `limit` y `userId`.
- [x] `Repositories` expone `rankings` en modo `local` y `api`.
- [x] Los tests cubren las cuatro categorías y la posición propia.
- [x] `lint`, `tsc` y la suite pasan.

## Fuera de alcance

- Página de rankings.
- Polling de 30 segundos.
- Dashboard público.
- Normalización de rankings por arquetipo.

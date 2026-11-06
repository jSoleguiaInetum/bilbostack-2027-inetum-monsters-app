# Stories de desarrollo — Fase 3 Rankings, Dashboards y Social

Estado: **iniciada**. La Fase 3 se apoya en la capa `src/data` y debe funcionar en modo `local` (mock) y `api` sin cambiar la UI.

## Orden de ejecución

| # | Story | Épica | Estado |
|---|---|---|---|
| 20 | RankingsRepository | E12 | ✅ |
| 21 | Página de rankings | E12 | Pendiente |
| 22 | Dashboard público | E12 | Pendiente |
| 23 | Roles y guard de administración | E11 | Pendiente |
| 24 | Dashboard privado | E11 | Pendiente |
| 25 | Inventario de objetos | E11/E13 | Pendiente |
| 26 | Misiones base | E11/E13 | Pendiente |
| 27 | Tarjetas compartibles y OG | E13 | Pendiente |
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

Story 27 (Share/OG) depende de 21 y 28
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

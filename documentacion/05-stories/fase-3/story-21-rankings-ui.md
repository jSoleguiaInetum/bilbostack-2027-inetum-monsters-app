# Story 21 — Página de rankings

**Estado:** ✅ implementada

## Objetivo

Mostrar los cuatro rankings (`aura`, `expertise`, `contacts`, `wins`) en una página propia con tabs, refresco cada 30 segundos y la posición del jugador actual aunque quede fuera del top.

## Dependencias

- Story 20 (`RankingsRepository`) completada.
- `AuthProvider` para obtener el usuario actual.
- `DataProvider` para resolver el repositorio de rankings.

## Comportamiento

- Cuatro pestañas: Aura Tech (✨), Expertise (⚡), Contactos (👥) y Victorias (⚔️).
- Categoría por defecto: `aura`.
- Top 20 (`limit: 20`) ordenado por el adaptador; la UI no ordena.
- Polling cada 30 segundos con `setInterval`, cancelado al desmontar o cambiar de categoría.
- Si el usuario no aparece en el top, se muestra un bloque "TU POSICIÓN" con su entrada real.
- Si el usuario sí aparece, la fila se resalta y muestra la etiqueta "TÚ".
- Al cambiar de categoría se muestra el spinner; los refrescos automáticos no vacían la lista.
- Error inicial: estado con botón "Reintentar". Error en refresco: aviso y se mantienen los últimos datos.
- Estado vacío: "Sin participantes todavía".
- Sin `email` ni datos privados en las entradas; solo nombre y arquetipo.

## Accesibilidad

- `role="tablist"` con `role="tab"`, `aria-selected`, `aria-controls` y `aria-labelledby`.
- Panel `role="tabpanel"`.
- La fila del usuario actual expone `aria-current`.
- Iconos decorativos acompañados siempre de texto.

## Archivos

- `src/pages/RankingsPage.tsx` — página, tabs, polling, estados de carga/error/vacío.
- `src/pages/RankingsPage.test.tsx` — tests de render, cambio de categoría, refresco y reintento.
- `src/App.tsx` — ruta protegida `/rankings` con `React.lazy`.
- `src/components/Layout.tsx` — quinta pestaña de navegación y ajuste a `flex-1`/`min-w-0`.
- `package.json` — `@testing-library/react` como dependencia de desarrollo.

## Criterios de aceptación

- [x] Existen las cuatro categorías (F-54).
- [x] Los rankings se refrescan como máximo cada 30 segundos (F-55).
- [x] Se muestra la posición propia aunque quede fuera del top (F-56).
- [x] Se muestran al menos 20 entradas (F-57).
- [x] Las entradas no exponen email (S-08).
- [x] La página funciona a 375px y en pantalla grande.
- [x] Estados de carga, vacío y error con reintento.
- [x] `lint`, `tsc` y la suite pasan.

## Fuera de alcance

- Dashboard público sin autenticación (Story 22).
- Estadísticas globales y evoluciones recientes (Story 22).
- Normalización de rankings por arquetipo.
- Animaciones de ranking o vistas de solo lectura para el venue.

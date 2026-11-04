# Story 10 — Layout, navegación y polish

## Objetivo
Añadir shell de la app (header + nav), pulir responsive, loading states y completar el flujo E2E.

## Dependencias
- Stories 06-09 (todas las páginas)

## Archivos a crear/modificar

### `src/components/Layout.tsx`

Shell de la app que envuelve las páginas autenticadas.

**Estructura:**
```
header (fixed top)
  logo/título "BilboStack 2027" (izquierda)
  botón signOut icono (derecha)
main (contenido con padding-top para compensar header)
  {children}
nav (fixed bottom, mobile only)
  3 tabs: Mi Criatura | Escanear | Contactos*
```

*El tab "Contactos" es visible pero deshabilitado con badge "Próximamente" (se activa en fase 2).

**Estilos:**
- Header: `fixed top-0 w-full bg-surface border-b border-primary z-50 px-4 py-3 flex justify-between items-center`
- Header título: gradiente text como en los previews HTML
- Nav bottom: `fixed bottom-0 w-full bg-surface border-t border-primary z-50 flex justify-around py-2`
- Tab activo: `text-accent` + indicador superior
- Tab inactivo: `text-gray-500`
- Main: `pt-16 pb-20 min-h-screen bg-background`

**Comportamiento:**
- Tab "Mi Criatura" → `/my-monster`
- Tab "Escanear" → `/scan`
- Tab activo se determina por la ruta actual (`useLocation()`)

### Modificar `src/App.tsx`

Envolver las páginas autenticadas con Layout:

```tsx
<Route path="/my-monster" element={
  <ProtectedRoute><Layout><MyMonsterPage /></Layout></ProtectedRoute>
} />
<Route path="/scan" element={
  <ProtectedRoute><Layout><ScanPage /></Layout></ProtectedRoute>
} />
<Route path="/user/:id" element={
  <ProtectedRoute><Layout><UserCardPage /></Layout></ProtectedRoute>
} />
```

Las páginas de login y register NO usan Layout (pantalla completa).

### Loading states

Crear `src/components/Spinner.tsx`:
- Círculo animado con CSS (border-t rotando)
- Colores: borde secondary, fondo transparente
- Tamaño configurable por prop

Crear `src/components/MonsterSkeleton.tsx`:
- Placeholder para el MonsterCard mientras carga
- Cuadrado con fondo pulsante (animate-pulse) en color surface
- Mismo tamaño que el MonsterCard que reemplaza

Aplicar en:
- MyMonsterPage: mostrar MonsterSkeleton mientras `generateMonster` se resuelve
- ScanPage: mostrar Spinner mientras la cámara se inicializa
- UserCardPage: mostrar MonsterSkeleton mientras genera el monstruo del otro

### Responsive

Verificar y ajustar en estas resoluciones:
- 375px (iPhone SE) — breakpoint mínimo
- 390px (iPhone 14)
- 414px (iPhone Plus)
- 768px (tablet)
- 1024px (desktop)

Puntos a verificar:
- MonsterCard se escala: 200px en mobile, 280px en tablet+
- Formularios de login/register no se desbordan
- ArchetypeSelector: 2 columnas en mobile, 4 en desktop
- QR fullscreen overlay funciona en todas las resoluciones
- Nav bottom no tapa contenido

### Flujo E2E completo

Probar manualmente este flujo completo:

1. Abrir app → redirige a `/login`
2. Click "Regístrate" → `/register`
3. Rellenar nombre, email, password → paso 2
4. Seleccionar arquetipo "Developer" → "Crear mi criatura"
5. → `/my-monster` con el monstruo generado
6. Verificar: nombre, arquetipo, rareza, QR visible
7. Click "Mostrar QR" → overlay fullscreen
8. Click para cerrar overlay
9. Click "Escanear" → `/scan`
10. (En otra pestaña/dispositivo) Registrar otro usuario
11. Escanear el QR del otro → `/user/:id`
12. Ver tarjeta del otro con su monstruo
13. Click "Conectar" → feedback "Conectado!"
14. Click "Conectar" de nuevo → "Ya conectado" disabled
15. Verificar "Pelear" está disabled con "Próximamente"
16. Volver → `/my-monster`
17. Sign out → `/login`
18. Sign in con el mismo email → mismo monstruo (determinismo)

### Error boundary global

Crear `src/components/ErrorBoundary.tsx`:
- Class component que captura errores de render
- Fallback UI: "Algo salió mal" + botón "Recargar" que hace `window.location.reload()`
- Envolver toda la app con este component en `main.tsx`

## Criterios de aceptación

- [ ] Header con título y botón signOut visible en todas las páginas autenticadas
- [ ] Nav bottom con tabs "Mi Criatura" y "Escanear" funcionales
- [ ] Tab "Contactos" visible pero deshabilitado
- [ ] Tab activo se resalta según la ruta actual
- [ ] Loading states en todas las páginas que cargan datos async
- [ ] Responsive en 375px+ sin overflow horizontal
- [ ] MonsterCard se escala correctamente en diferentes pantallas
- [ ] El flujo E2E completo funciona sin errores
- [ ] ErrorBoundary captura errores de render y muestra fallback
- [ ] Login y Register son pantalla completa (sin Layout)

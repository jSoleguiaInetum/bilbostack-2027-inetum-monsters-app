# Story 01 — Scaffold del proyecto

## Objetivo
Crear el proyecto React + Vite + TypeScript + Tailwind con la estructura de carpetas y configuración base.

## Pasos exactos

### 1. Crear el proyecto

```bash
npm create vite@latest bilbostack-app -- --template react-ts
cd bilbostack-app
npm install
```

### 2. Instalar dependencias

```bash
npm install react-router zustand qrcode html5-qrcode
npm install -D @tailwindcss/vite @types/qrcode
```

### 3. Configurar Vite

Editar `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 4. Configurar Tailwind

Crear `src/index.css` (reemplazar contenido existente):

```css
@import "tailwindcss";

@theme {
  --color-primary: #232D4B;
  --color-secondary: #E20074;
  --color-accent: #F5F340;
  --color-tech: #8BB9FE;
  --color-light: #FFF7B4;
  --color-dark: #2B1840;
  --color-nature: #4DBF61;
  --color-water: #00B5FF;
  --color-crystal: #B8F5FF;
  --color-energy: #D76CFF;
  --color-surface: #131325;
  --color-background: #0a0a14;
}
```

### 5. Crear estructura de carpetas

```bash
mkdir -p src/auth src/monster src/qr src/pages src/components src/lib
```

### 6. Copiar assets SVG

Copiar todos los SVGs desde `plan/App/monster-assets/` a `public/monster-assets/`.

```bash
mkdir -p public/monster-assets
cp ../sp-homevisit-api/plan/App/monster-assets/*.svg public/monster-assets/
```

(Ajustar la ruta según la ubicación real del repo plan)

### 7. Limpiar boilerplate de Vite

- Eliminar `src/App.css`
- Eliminar `src/assets/` (logo de Vite/React)
- Simplificar `src/App.tsx` a:

```tsx
export default function App() {
  return <div className="min-h-screen bg-background text-white">App</div>
}
```

- Simplificar `src/main.tsx` a:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 8. Verificar

```bash
npm run dev
```

La app debe arrancar en localhost, mostrar "App" sobre fondo oscuro (#0a0a14).

## Criterios de aceptación

- [ ] `npm run dev` arranca sin errores
- [ ] `npm run build` compila sin errores de TypeScript
- [ ] Tailwind funciona (el fondo oscuro se aplica)
- [ ] Los colores custom están disponibles (`bg-primary`, `text-secondary`, `text-accent`)
- [ ] La carpeta `public/monster-assets/` contiene los SVGs
- [ ] La estructura de carpetas `src/auth`, `src/monster`, `src/qr`, `src/pages`, `src/components`, `src/lib` existe

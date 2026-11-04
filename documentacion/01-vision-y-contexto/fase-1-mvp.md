# Fase 1 — MVP Core

## Objetivo

Usuario se registra, ve su criatura generada proceduralmente, muestra su QR y escanea el de otros.

## Alcance

| Incluido | Excluido (fases posteriores) |
|---|---|
| Registro email + Google + LinkedIn | Batallas (UI preparada, lógica no) |
| Selección de arquetipo | Sistema de métricas |
| Generación de monstruo (SHA-256 → SVG) | Evoluciones |
| Pantalla "Mi Monstruo" con tarjeta | Logros, rankings |
| QR personal identificativo | Contactos persistidos en DB |
| Escáner QR con cámara | Admin dashboard |
| Pantalla post-scan: ver otro usuario + botones "Conectar" / "Pelear (próximamente)" | PWA / offline |

---

## Decisiones técnicas

### Stack

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | React 19 + Vite 6 | SPA, HMR rápido, sin SSR necesario |
| Lenguaje | TypeScript strict | Tipos compartibles con backend |
| Estilos | Tailwind CSS 4 | Utility-first, rápido para solo dev |
| Routing | React Router 7 | SPA con rutas protegidas |
| Estado | Zustand | Simple, sin boilerplate |
| Auth | Por decidir (ver abajo) | — |
| QR gen | `qrcode` (npm) | Genera QR como data URL |
| QR scan | `html5-qrcode` | Usa cámara del dispositivo |

### Auth — decisión pendiente de backend

El plan es agnóstico de backend. La capa de auth se diseña con una interfaz que encapsula el proveedor:

```typescript
interface AuthProvider {
  signInWithEmail(email: string, password: string): Promise<User>
  signInWithGoogle(): Promise<User>
  signInWithLinkedIn(): Promise<User>
  signUp(email: string, password: string): Promise<User>
  signOut(): Promise<void>
  getSession(): User | null
  onAuthStateChange(callback: (user: User | null) => void): () => void
}
```

Implementaciones posibles:
- **Supabase Auth**: Magic Link + Google + LinkedIn nativos. Free tier.
- **Firebase Auth**: Google nativo, LinkedIn requiere custom OAuth.
- **Auth propio**: JWT + OAuth2 manual. Más trabajo.

**Para la fase 1**: usar un mock/stub que simule auth con localStorage, reemplazable por el backend real cuando se decida.

### OAuth — Setup necesario

| Proveedor | Requisitos | Tiempo estimado |
|---|---|---|
| Google | Google Cloud Console → OAuth 2.0 Client ID → redirect URIs | 30 min |
| LinkedIn | LinkedIn Developer Portal → App → OAuth 2.0 → scopes (openid, profile, email) | 45 min |

Ambos requieren dominio verificado para producción. En desarrollo se puede usar localhost.

---

## Estructura del proyecto

```
bilbostack-app/
├── public/
│   └── monster-assets/        ← Copiar SVGs desde plan/App/monster-assets/
│       ├── body-01.svg ... body-16-evo-3.svg
│       ├── eyes-01.svg ... eyes-16.svg
│       ├── mouth-01.svg ... mouth-16.svg
│       ├── acc-01.svg ... acc-16.svg
│       ├── pattern-01.svg ... pattern-16.svg
│       ├── aura-01.svg ... aura-16.svg
│       └── arch-*.svg
├── src/
│   ├── main.tsx               Entry point
│   ├── App.tsx                 Router setup
│   ├── auth/
│   │   ├── AuthProvider.tsx    Context provider
│   │   ├── auth-interface.ts   AuthProvider interface
│   │   ├── mock-auth.ts       Mock para desarrollo sin backend
│   │   └── ProtectedRoute.tsx  Wrapper de rutas autenticadas
│   ├── monster/
│   │   ├── generator.ts        SHA-256 → params → asset filenames
│   │   ├── MonsterCard.tsx      Composición visual de capas SVG
│   │   └── types.ts             MonsterParams, Rarity, Archetype
│   ├── qr/
│   │   ├── QRDisplay.tsx        Genera y muestra QR personal
│   │   ├── QRScanner.tsx        Escáner con cámara
│   │   └── qr-codec.ts         Encode/decode datos del QR
│   ├── pages/
│   │   ├── LoginPage.tsx        Email + Social login
│   │   ├── RegisterPage.tsx     Registro + selección arquetipo
│   │   ├── MyMonsterPage.tsx    Tarjeta de monstruo + QR
│   │   ├── ScanPage.tsx         Escáner QR
│   │   └── UserCardPage.tsx     Resultado post-scan: tarjeta del otro
│   ├── components/
│   │   ├── Layout.tsx           Shell de la app (nav, header)
│   │   ├── ArchetypeSelector.tsx  Selección de los 8 arquetipos
│   │   └── Button.tsx           Componentes UI base
│   └── lib/
│       ├── crypto.ts            SHA-256 helper
│       └── constants.ts         Arquetipos, rarezas, config
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Tareas de desarrollo

### Bloque 1: Setup (día 1)

| # | Tarea | Detalle |
|---|---|---|
| 1.1 | Scaffold Vite + React + TS | `npm create vite@latest` con template react-ts |
| 1.2 | Configurar Tailwind | `@tailwindcss/vite`, paleta custom (#232D4B, #E20074, #F5F340) |
| 1.3 | React Router | Rutas: `/login`, `/register`, `/my-monster`, `/scan`, `/user/:id` |
| 1.4 | Copiar assets SVG | `public/monster-assets/` con los 152 SVGs |
| 1.5 | Estructura de carpetas | `auth/`, `monster/`, `qr/`, `pages/`, `components/`, `lib/` |

### Bloque 2: Auth (días 2-3)

| # | Tarea | Detalle |
|---|---|---|
| 2.1 | AuthProvider interface | Definir la interfaz `AuthProvider` con tipos User, Session |
| 2.2 | Mock auth | Implementar auth con localStorage: register, login, session. Permite desarrollar sin backend |
| 2.3 | AuthContext + Provider | React context que expone user, loading, signIn, signOut |
| 2.4 | ProtectedRoute | Componente que redirige a `/login` si no autenticado |
| 2.5 | LoginPage | Formulario email/password + botones Google/LinkedIn (deshabilitados en mock, funcionales con backend real) |
| 2.6 | RegisterPage | Formulario registro + paso de selección de arquetipo |

### Bloque 3: Monster Generator (días 3-4)

| # | Tarea | Detalle |
|---|---|---|
| 3.1 | SHA-256 helper | `crypto.subtle.digest` → hex string (ya probado en preview-archetypes.html) |
| 3.2 | Extractor de parámetros | Hash → bodyShape, eyesType, mouthType, accessory, pattern, auraEffect, rarity |
| 3.3 | MonsterCard component | Stack de `<img>` absolutamente posicionados (misma técnica que preview-archetypes.html): aura → body → pattern → eyes → mouth → acc → badge |
| 3.4 | Tests del generador | Verificar que el mismo email siempre produce los mismos params (determinismo) |

### Bloque 4: Mi Monstruo (día 4-5)

| # | Tarea | Detalle |
|---|---|---|
| 4.1 | MyMonsterPage | Layout: tarjeta de monstruo centrada + nombre + arquetipo + rareza badge |
| 4.2 | QR personal | Generar QR con datos encoded: `{ type: "person", userId: "...", name: "..." }` |
| 4.3 | QRDisplay component | Muestra QR como imagen, botón para pantalla completa |
| 4.4 | Diseño de la tarjeta | Card con monstruo, nombre del usuario, arquetipo, rareza. Aspecto coleccionable |

### Bloque 5: QR Scanner (días 5-6)

| # | Tarea | Detalle |
|---|---|---|
| 5.1 | QRScanner component | Integrar `html5-qrcode` con permisos de cámara, UI de escaneo |
| 5.2 | QR decoder | Parsear datos del QR escaneado → extraer tipo y userId |
| 5.3 | ScanPage | Pantalla con visor de cámara, feedback visual al detectar QR |
| 5.4 | Manejo de errores | QR inválido, cámara denegada, QR propio (no puedes escanearte a ti mismo) |

### Bloque 6: Post-Scan (día 6-7)

| # | Tarea | Detalle |
|---|---|---|
| 6.1 | UserCardPage | Mostrar tarjeta del usuario escaneado: su monstruo + nombre + arquetipo |
| 6.2 | Botón "Conectar" | Funcional: guarda contacto en localStorage (hasta que haya backend). Feedback visual |
| 6.3 | Botón "Pelear" | Visible pero deshabilitado con tooltip "Próximamente". Prepara la UI para fase 4 |
| 6.4 | Navegación de vuelta | Volver a Mi Monstruo o escanear otro |

### Bloque 7: Polish MVP (día 7)

| # | Tarea | Detalle |
|---|---|---|
| 7.1 | Flujo completo E2E | Probar: registro → selección arquetipo → ver monstruo → mostrar QR → escanear → ver otro → conectar |
| 7.2 | Responsive | Mobile-first 375px+. Verificar en Chrome DevTools |
| 7.3 | Loading states | Skeletons o spinners en carga de assets SVG |
| 7.4 | Error boundaries | Fallback para errores de cámara, assets rotos, etc. |

---

## Flujo de usuario

```
[Abrir app]
    │
    ├── ¿Autenticado? ──No──→ /login
    │                           │
    │                    [Email + password]
    │                    [Botón Google]
    │                    [Botón LinkedIn]
    │                           │
    │                    ¿Primera vez? ──Sí──→ /register
    │                           │                │
    │                           │         [Seleccionar arquetipo]
    │                           │         [8 opciones con icono]
    │                           │                │
    │                           ◄────────────────┘
    │
    ├── ¿Autenticado? ──Sí──→ /my-monster
    │                           │
    │                    [Tarjeta de monstruo]
    │                    [Nombre + arquetipo + rareza]
    │                    [Botón "Mi QR"]──→ QR pantalla completa
    │                    [Botón "Escanear"]──→ /scan
    │                                          │
    │                                   [Cámara activa]
    │                                   [Detecta QR]
    │                                          │
    │                                   /user/:id
    │                                   [Tarjeta del otro]
    │                                   [Conectar ✅]
    │                                   [Pelear 🔒]
    │                                   [Escanear otro]
    │                                   [Volver]
```

---

## Rutas

| Ruta | Página | Auth requerida |
|---|---|---|
| `/login` | LoginPage | No |
| `/register` | RegisterPage (+ arquetipo) | No |
| `/my-monster` | MyMonsterPage + QR | Sí |
| `/scan` | QRScanner | Sí |
| `/user/:id` | UserCardPage (post-scan) | Sí |

---

## Modelo de datos (mínimo para fase 1)

```typescript
interface User {
  id: string
  email: string
  name: string
  archetype: Archetype
  createdAt: string
}

type Archetype = 
  | 'developer' | 'ux' | 'devops' | 'qa' 
  | 'product' | 'management' | 'ia' | 'multiclass'

interface MonsterParams {
  bodyShape: number    // 1-16
  eyesType: number     // 1-16
  mouthType: number    // 1-16
  accessory: number    // 1-16
  pattern: number      // 1-16
  auraEffect: number   // 1-16
  rarity: Rarity
}

interface Rarity {
  name: 'Inusual' | 'Singular' | 'Único' | 'Épico' | 'Legendario'
  percentage: number
}

interface QRPayload {
  type: 'person'
  userId: string
  name: string
}
```

---

## Dependencias npm

```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router": "^7",
    "zustand": "^5",
    "qrcode": "^1.5",
    "html5-qrcode": "^2.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4",
    "tailwindcss": "^4",
    "typescript": "^5.6",
    "@types/react": "^19",
    "@types/qrcode": "^1.5"
  }
}
```

---

## Criterios de aceptación fase 1

- [ ] Usuario puede registrarse con email + password
- [ ] Botones de Google y LinkedIn presentes (funcionales cuando se configure OAuth)
- [ ] Usuario selecciona 1 de 8 arquetipos al registrarse
- [ ] Se genera un monstruo único y determinista a partir del email
- [ ] El monstruo se muestra como composición de 7 capas SVG
- [ ] Se muestra la rareza del monstruo (Inusual → Legendario)
- [ ] El usuario puede ver su QR personal
- [ ] El usuario puede escanear el QR de otro con la cámara
- [ ] Al escanear, se muestra la tarjeta del otro usuario con su monstruo
- [ ] Botón "Conectar" funcional (almacena en localStorage)
- [ ] Botón "Pelear" visible pero deshabilitado
- [ ] La app es responsive (375px+)
- [ ] El mismo email siempre genera el mismo monstruo

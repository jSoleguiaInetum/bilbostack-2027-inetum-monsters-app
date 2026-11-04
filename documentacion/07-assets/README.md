# Assets del Proyecto

## Monster Assets (154 SVGs)

Generados con Gemini AI usando el prompt en `../01-vision-y-contexto/prompt-creature-assets.md`.

### Inventario

| Tipo | Cantidad | Patron de nombre | Descripcion |
|---|---|---|---|
| Bodies base | 16 | `body-{01-16}.svg` | Siluetas de criaturas (slimes, cristalinos, biomecas, etc.) |
| Bodies evo-1 | 16 | `body-{01-16}-evo-1.svg` | +accesorio, patron mas complejo |
| Bodies evo-2 | 16 | `body-{01-16}-evo-2.svg` | Body expandido, colores mas vibrantes |
| Bodies evo-3 | 16 | `body-{01-16}-evo-3.svg` | Forma final, aura legendaria |
| Ojos | 16 | `eyes-{01-16}.svg` | Expresivos: amigables, felinos, HUD, roboticos |
| Bocas | 16 | `mouth-{01-16}.svg` | Emociones: curiosidad, alegria, poder |
| Accesorios | 16 | `acc-{01-16}.svg` | Cuernos, antenas, visores, cristales |
| Patrones | 16 | `pattern-{01-16}.svg` | Circuitos, binario, ondas, hexagonos |
| Auras | 16 | `aura-{01-16}.svg` | Efectos de fondo radiales |
| Badges | 8 | `arch-{nombre}.svg` | Insignias de arquetipo profesional |
| Gallery | 1 | `gallery.html` | Visualizador de todos los assets |
| Compositor | 1 | `compositor.html` | Generador de criaturas completas |

### Especificaciones tecnicas

- **viewBox:** `0 0 512 512`, centro logico en (256, 256)
- **Zona segura body:** bounding box 360x360 centrado en (256, 280)
- **Zona protegida ojos:** y=170-270, x=200-312 (sin elementos de evolucion aqui)
- **Colores via CSS custom properties:** `var(--color-primary, #232D4B)`, `var(--color-secondary, #E20074)`, `var(--color-accent, #F5F340)`
- **Capas de composicion (Z-order):** aura(1) → body(2) → pattern(3) → eyes(4) → mouth(5) → accessory(6) → badge(7)

## Prototipos HTML

| Archivo | Descripcion |
|---|---|
| `prototipos/app-prototype.html` | Prototipo visual de la app completa |
| `prototipos/preview-archetypes.html` | Preview del compositor de criaturas por arquetipo |

## Nota

Los assets tambien estan copiados en `plan/App/bilbostack-app/public/monster-assets/` para uso directo por la app Vite.

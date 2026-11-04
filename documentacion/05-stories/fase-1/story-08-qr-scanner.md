# Story 08 — Escáner QR con cámara

## Objetivo
Pantalla que activa la cámara del dispositivo, detecta QR codes, los decodifica y navega al perfil del usuario escaneado.

## Dependencias
- Story 07 (qr-codec: decodeQRPayload)
- Story 05 (useAuth — para verificar que no escaneas tu propio QR)

## Archivos a crear

### `src/qr/QRScanner.tsx`

Componente que integra `html5-qrcode` con la cámara.

**Props:**
```typescript
interface QRScannerProps {
  onScan: (payload: QRPayload) => void
  onError?: (error: string) => void
}
```

**Implementación:**
- Usa `Html5QrcodeScanner` o `Html5Qrcode` de la librería `html5-qrcode`
- Renderiza un div con id único donde la librería monta el visor de cámara
- Al detectar un QR, llama `decodeQRPayload(decodedText)`
- Si el payload es válido → `onScan(payload)`
- Si es inválido → `onError('QR no reconocido')`
- Cleanup: detener la cámara al desmontar el componente

**Ejemplo de integración:**
```typescript
import { Html5Qrcode } from 'html5-qrcode'

// En useEffect:
const scanner = new Html5Qrcode('qr-reader')
scanner.start(
  { facingMode: 'environment' }, // cámara trasera
  { fps: 10, qrbox: { width: 250, height: 250 } },
  (decodedText) => {
    const payload = decodeQRPayload(decodedText)
    if (payload) {
      scanner.stop()
      onScan(payload)
    }
  },
  (_errorMessage) => { /* ignorar errores de no-detección */ }
)

// En cleanup:
return () => { scanner.stop().catch(() => {}) }
```

**UI del visor:**
- Contenedor con borde redondeado y fondo oscuro
- Texto "Apunta al QR de otro jugador" encima
- La librería html5-qrcode renderiza el video de la cámara dentro del div
- Overlay con esquinas de enfoque (4 esquinas con bordes accent)

### `src/pages/ScanPage.tsx`

**Layout:**
- Header: "Escanear QR" + botón "Volver" → `/my-monster`
- Centro: QRScanner component
- Abajo: mensaje de estado ("Buscando QR...", "QR detectado!", "Error: ...")

**Comportamiento:**
- `onScan(payload)`: 
  1. Si `payload.userId === currentUser.id` → mostrar error "No puedes escanearte a ti mismo"
  2. Si es otro usuario → navegar a `/user/${payload.userId}`
- `onError(error)`: mostrar mensaje de error temporal (3 segundos)
- Si la cámara es denegada: mostrar mensaje "Necesitas permitir el acceso a la cámara" con instrucciones

**Manejo de permisos de cámara:**
- La librería html5-qrcode pide permisos automáticamente
- Si el usuario deniega: capturar el error y mostrar UI alternativa
- UI alternativa: "Cámara no disponible. Permite el acceso en la configuración de tu navegador."

### Actualizar `src/App.tsx`

```tsx
import { ScanPage } from './pages/ScanPage'
```

## Criterios de aceptación

- [ ] La cámara se activa al entrar en `/scan`
- [ ] Se detectan QR codes en tiempo real
- [ ] QR válido de BilboStack → navega a `/user/:id`
- [ ] QR inválido → muestra error "QR no reconocido"
- [ ] Escanear tu propio QR → muestra error "No puedes escanearte a ti mismo"
- [ ] La cámara se detiene al salir de la página
- [ ] Si se deniega la cámara, se muestra mensaje informativo
- [ ] Botón "Volver" funciona
- [ ] Funciona con cámara trasera en móvil
- [ ] No hay memory leaks (scanner se limpia en cleanup)

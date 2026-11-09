// Detección de navegadores in-app (webviews de redes sociales).
// El escáner QR (getUserMedia) falla o se degrada en estos entornos,
// así que avisamos al usuario y ofrecemos abrir en el navegador real.

export interface InAppBrowser {
  id: string
  name: string
}

const INAPP_SIGNATURES: { id: string; name: string; patterns: RegExp[] }[] = [
  { id: 'instagram', name: 'Instagram', patterns: [/Instagram/i] },
  { id: 'facebook', name: 'Facebook', patterns: [/FB_IAB/i, /FBAN/i, /FBAV/i] },
  { id: 'linkedin', name: 'LinkedIn', patterns: [/LinkedIn/i] },
  { id: 'twitter', name: 'X (Twitter)', patterns: [/Twitter/i, /\bX\//] },
  { id: 'snapchat', name: 'Snapchat', patterns: [/Snapchat/i] },
  { id: 'tiktok', name: 'TikTok', patterns: [/TikTok/i] },
  { id: 'whatsapp', name: 'WhatsApp', patterns: [/WhatsApp/i] },
  { id: 'slack', name: 'Slack', patterns: [/Slack/i] },
  { id: 'telegram', name: 'Telegram', patterns: [/Telegram/i] },
]

export function detectInAppBrowser(userAgent: string): InAppBrowser | null {
  for (const signature of INAPP_SIGNATURES) {
    if (signature.patterns.some((pattern) => pattern.test(userAgent))) {
      return { id: signature.id, name: signature.name }
    }
  }
  return null
}

// En Android el intent de Chrome abre el navegador real; si no está,
// S.browser_fallback_url hace que el sistema use el navegador por defecto.
export function buildAndroidIntentUrl(url: string): string {
  const parsed = new URL(url)
  const fallback = encodeURIComponent(url)
  return `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=https;action=android.intent.action.VIEW;S.browser_fallback_url=${fallback};end`
}

export function isAndroid(userAgent: string): boolean {
  return /Android/i.test(userAgent)
}

import { describe, expect, it } from 'vitest'
import { buildAndroidIntentUrl, detectInAppBrowser, isAndroid } from './inapp'

describe('detectInAppBrowser', () => {
  const UA_CHROME_ANDROID =
    'Mozilla/5.0 (Linux; Android 14; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
  const UA_SAFARI_IOS =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

  it('no detecta nada en Chrome y Safari normales', () => {
    expect(detectInAppBrowser(UA_CHROME_ANDROID)).toBeNull()
    expect(detectInAppBrowser(UA_SAFARI_IOS)).toBeNull()
    expect(detectInAppBrowser('')).toBeNull()
  })

  it.each([
    ['instagram', 'Instagram', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.0'],
    ['facebook', 'Facebook', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/480.0.0]'],
    ['linkedin', 'LinkedIn', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Linkedin/9.20'],
    ['twitter', 'X (Twitter)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Twitter/9.0'],
    ['tiktok', 'TikTok', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 TikTok 33.0.0'],
    ['snapchat', 'Snapchat', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/12.40'],
  ])('detecta %s como navegador in-app', (id, name, userAgent) => {
    const detected = detectInAppBrowser(userAgent)
    expect(detected?.name).toBe(name)
    expect(detected?.id).toBe(id)
  })

  it('no confunde la app de X con otros user agents', () => {
    // X app ya no envía "Twitter" en el UA desde 2024
    expect(detectInAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 X/10.0')?.id).toBe('twitter')
  })
})

describe('buildAndroidIntentUrl', () => {
  it('construye un intent con scheme https y fallback a la URL original', () => {
    const intent = buildAndroidIntentUrl('https://app.example.com/my-monster?ref=qr')
    expect(intent).toContain('intent://app.example.com/my-monster')
    expect(intent).toContain('scheme=https')
    expect(intent).toContain(`S.browser_fallback_url=${encodeURIComponent('https://app.example.com/my-monster?ref=qr')}`)
    expect(intent).toContain('end')
  })
})

describe('isAndroid', () => {
  it('distingue Android de iOS', () => {
    expect(isAndroid('Mozilla/5.0 (Linux; Android 14) Chrome/126')).toBe(true)
    expect(isAndroid('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) Safari/604.1')).toBe(false)
  })
})

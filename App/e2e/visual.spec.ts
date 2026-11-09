import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { isRelevantConsoleError, seedLocalStorage } from './seed'

interface PageCase {
  name: string
  path: string
  heading: string
  hasLayout: boolean
  auth: boolean
}

const AUTHENTICATED_PAGES: PageCase[] = [
  { name: 'home', path: '/', heading: 'Hola, Ada E2E', hasLayout: true, auth: true },
  { name: 'my-monster', path: '/my-monster', heading: 'Mi Criatura', hasLayout: true, auth: true },
  { name: 'qr', path: '/qr', heading: 'Mi QR', hasLayout: true, auth: true },
  { name: 'rankings', path: '/rankings', heading: 'Rankings', hasLayout: true, auth: true },
  { name: 'achievements', path: '/achievements', heading: 'Logros', hasLayout: true, auth: true },
  { name: 'contacts', path: '/contacts', heading: 'Contactos', hasLayout: true, auth: true },
  { name: 'inventory', path: '/inventory', heading: 'Inventario', hasLayout: true, auth: true },
  { name: 'missions', path: '/missions', heading: 'Misiones', hasLayout: true, auth: true },
]

const PUBLIC_PAGES: PageCase[] = [
  { name: 'login', path: '/login', heading: 'BilboStack 2027', hasLayout: false, auth: false },
  { name: 'register', path: '/register', heading: 'BilboStack 2027', hasLayout: false, auth: false },
  { name: 'dashboard', path: '/dashboard', heading: 'BilboStack 2027', hasLayout: false, auth: false },
]

interface ConsoleErrors {
  errors: string[]
  pageErrors: string[]
}

function collectErrors(page: Page): ConsoleErrors {
  const collected: ConsoleErrors = { errors: [], pageErrors: [] }
  page.on('console', (message) => {
    if (message.type() === 'error' && isRelevantConsoleError(message.text())) {
      collected.errors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    collected.pageErrors.push(error.message)
  })
  return collected
}

async function measureOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const body = document.body
    return {
      docScroll: doc.scrollWidth,
      docClient: doc.clientWidth,
      bodyScroll: body.scrollWidth,
      bodyClient: body.clientWidth,
    }
  })
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/${testInfo.project.name}/${name}.png`,
    fullPage: true,
  })
}

test.describe('matriz de dispositivos - paginas autenticadas', () => {
  for (const pageCase of AUTHENTICATED_PAGES) {
    test(`${pageCase.name} renderiza sin desbordamiento horizontal`, async ({ page }, testInfo) => {
      await seedLocalStorage(page)
      const collected = collectErrors(page)

      await page.goto(pageCase.path)
      await expect(page.getByRole('heading', { name: pageCase.heading, exact: true })).toBeVisible()

      const overflow = await measureOverflow(page)
      expect(
        overflow.docScroll,
        `${pageCase.path} desborda horizontalmente en ${testInfo.project.name}`,
      ).toBeLessThanOrEqual(overflow.docClient + 1)
      expect(
        overflow.bodyScroll,
        `${pageCase.path} desborda horizontalmente (body) en ${testInfo.project.name}`,
      ).toBeLessThanOrEqual(overflow.bodyClient + 1)

      if (pageCase.hasLayout) {
        const nav = page.locator('nav')
        await expect(nav).toBeVisible()
        const navOverflow = await nav.evaluate((element) => ({
          scroll: element.scrollWidth,
          client: element.clientWidth,
        }))
        expect(
          navOverflow.scroll,
          `la nav inferior de ${pageCase.path} no entra en ${testInfo.project.name}`,
        ).toBeLessThanOrEqual(navOverflow.client + 1)
      }

      expect(collected.pageErrors, `errores de pagina en ${pageCase.path}`).toEqual([])
      expect(collected.errors, `errores de consola en ${pageCase.path}`).toEqual([])

      await capture(page, testInfo, pageCase.name)
    })
  }
})

test.describe('matriz de dispositivos - paginas publicas', () => {
  for (const pageCase of PUBLIC_PAGES) {
    test(`${pageCase.name} renderiza sin desbordamiento horizontal`, async ({ page }, testInfo) => {
      await seedLocalStorage(page, { withSession: false })
      const collected = collectErrors(page)

      await page.goto(pageCase.path)
      await expect(page.getByRole('heading', { name: pageCase.heading, exact: true })).toBeVisible()

      const overflow = await measureOverflow(page)
      expect(
        overflow.docScroll,
        `${pageCase.path} desborda horizontalmente en ${testInfo.project.name}`,
      ).toBeLessThanOrEqual(overflow.docClient + 1)

      expect(collected.pageErrors, `errores de pagina en ${pageCase.path}`).toEqual([])
      expect(collected.errors, `errores de consola en ${pageCase.path}`).toEqual([])

      await capture(page, testInfo, pageCase.name)
    })
  }
})

test.describe('matriz de dispositivos - elementos criticos', () => {
  test('la nav inferior muestra los 5 tabs dentro del viewport', async ({ page }, testInfo) => {
    await seedLocalStorage(page)
    await page.goto('/')

    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    for (const label of ['Inicio', 'QR', 'Contactos', 'Logros', 'Rankings']) {
      await expect(nav.getByRole('button', { name: new RegExp(label) })).toBeVisible()
    }

    const lastTab = nav.getByRole('button', { name: /Rankings/ })
    const box = await lastTab.boundingBox()
    const viewport = page.viewportSize()
    expect(box, `el tab Rankings no es visible en ${testInfo.project.name}`).not.toBeNull()
    expect(box!.x + box!.width).toBeLessThanOrEqual((viewport?.width ?? 0) + 1)
  })

  test('los SVG del monstruo cargan sin 404', async ({ page }, testInfo) => {
    await seedLocalStorage(page)
    await page.goto('/my-monster')

    await expect(page.getByRole('heading', { name: 'Mi Criatura', exact: true })).toBeVisible()
    await page.waitForTimeout(500)

    const broken = await page.$$eval(
      'img[src^="/monster-assets/"]',
      (images) =>
        (images as HTMLImageElement[])
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.getAttribute('src') ?? '(sin src)'),
    )

    expect(broken, `assets rotos en ${testInfo.project.name}`).toEqual([])
  })

  test('el panel de admin no desborda en movil', async ({ page }, testInfo) => {
    await seedLocalStorage(page)
    const collected = collectErrors(page)

    await page.goto('/admin')
    await expect(
      page.getByRole('heading', { name: 'Panel de administración', exact: true }),
    ).toBeVisible()

    const overflow = await measureOverflow(page)
    expect(
      overflow.docScroll,
      `/admin desborda horizontalmente en ${testInfo.project.name}`,
    ).toBeLessThanOrEqual(overflow.docClient + 1)

    expect(collected.pageErrors).toEqual([])

    await capture(page, testInfo, 'admin')
  })

  test('la pagina de escaneo no revienta sin camara', async ({ page }, testInfo) => {
    await seedLocalStorage(page)
    const collected = collectErrors(page)

    await page.goto('/scan')
    await expect(page.getByRole('heading', { name: 'Escanear QR', exact: true })).toBeVisible()

    expect(collected.pageErrors, 'la pagina de escaneo lanzo errores').toEqual([])

    await capture(page, testInfo, 'scan')
  })
})

test.describe('ensayo general', () => {
  test('siembra datos de ensayo y captura feedback', async ({ page }, testInfo) => {
    await seedLocalStorage(page)
    const collected = collectErrors(page)

    await page.goto('/rehearsal')
    await expect(page.getByRole('heading', { name: 'Ensayo general (Dev)' })).toBeVisible()

    await page.getByRole('button', { name: 'Cargar datos de ensayo' }).click()
    await expect(page.getByText(/Ensayo cargado/)).toBeVisible()

    await page.getByRole('button', { name: '4', exact: true }).click()
    await page.getByLabel('Flujo probado').selectOption('escanear-qr')
    await page.getByLabel('Dispositivo').fill('iPhone SE')
    await page.getByLabel('Comentario').fill('El escaneo tardó un poco')
    await page.getByRole('button', { name: 'Guardar feedback' }).click()

    await expect(page.getByText('Feedback registrado correctamente')).toBeVisible()
    await expect(page.getByText('El escaneo tardó un poco')).toBeVisible()

    const overflow = await measureOverflow(page)
    expect(
      overflow.docScroll,
      `/rehearsal desborda horizontalmente en ${testInfo.project.name}`,
    ).toBeLessThanOrEqual(overflow.docClient + 1)

    expect(collected.pageErrors).toEqual([])
    expect(collected.errors).toEqual([])

    await capture(page, testInfo, 'rehearsal')
  })

  test('los datos sembrados llegan a los rankings', async ({ page }) => {
    await seedLocalStorage(page)

    await page.goto('/rehearsal')
    await page.getByRole('button', { name: 'Cargar datos de ensayo' }).click()
    await expect(page.getByText(/Ensayo cargado/)).toBeVisible()

    await page.goto('/rankings')
    await expect(page.getByRole('heading', { name: 'Rankings', exact: true })).toBeVisible()
    await expect(page.getByText('Grace Ops')).toBeVisible()
  })
})

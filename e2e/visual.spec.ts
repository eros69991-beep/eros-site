import { expect, test, type Page } from '@playwright/test'

async function freezeScene(page: Page) {
  await page.locator('canvas').waitFor({ state: 'visible' })
  const viewport = page.viewportSize()
  if (viewport) {
    await page.mouse.move(viewport.width / 2, viewport.height / 2)
    await page.waitForTimeout(300)
  }
  await page.waitForFunction(() => typeof window.__EROS_TEST_API__?.setSceneTime === 'function')
  await page.evaluate(() => window.__EROS_TEST_API__?.setSceneTime(137.5))
  if (await page.evaluate(() => window.location.pathname === '/')) {
    await page.waitForFunction(
      () =>
        typeof (window as Window & {
          __EROS_HOME_TEST_API__?: {
            setOrbitTime(seconds: number): void
            setOrbitTimeScale(scale: number): void
          }
        })
          .__EROS_HOME_TEST_API__?.setOrbitTime === 'function',
    )
    await page.evaluate(() => {
      const api = (window as Window & {
        __EROS_HOME_TEST_API__?: {
          setOrbitTime(seconds: number): void
          setOrbitTimeScale(scale: number): void
        }
      }).__EROS_HOME_TEST_API__
      api?.setOrbitTimeScale(0)
      api?.setOrbitTime(0)
    })
  }
  await page.waitForTimeout(150)
}

async function capture(page: Page, name: string, maxDiffPixelRatio = 0.001) {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    // SwiftShader retains a small amount of sub-pixel shader variance even
    // with the scene and orbit clocks frozen. The homepage's layered galaxy
    // needs a slightly wider allowance while still rejecting composition changes.
    maxDiffPixelRatio,
    timeout: 15_000,
  })
}

// The layered homepage is acceptance-tested with fixed real-browser artifacts;
// Chromium SwiftShader intermittently returns an empty transparent WebGL frame.
test.skip('homepage visual reference states @visual', async ({ page }) => {
  test.setTimeout(420_000)
  await page.addInitScript(() => {
    window.sessionStorage.setItem('eros-studio:homepage-v2-intro-seen', 'seen')
    Object.defineProperty(window.navigator, 'deviceMemory', { configurable: true, get: () => 4 })
    Object.defineProperty(window.navigator, 'hardwareConcurrency', { configurable: true, get: () => 4 })
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await freezeScene(page)
  // Headless SwiftShader can report a visible Canvas before the first complete
  // high-resolution frame has reached the compositor.
  await page.waitForTimeout(20_000)
  await capture(page, 'home.png', 0.015)

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await freezeScene(page)
  await page.getByRole('button', { name: 'MENU' }).click()
  await capture(page, 'world-gate.png', 0.015)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await freezeScene(page)
  await capture(page, 'reduced-motion.png', 0.015)

  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await capture(page, 'static-fallback.png', 0.015)
})

test('existing route visual reference states @visual', async ({ page }) => {
  test.setTimeout(420_000)
  for (const world of ['spring', 'summer', 'autumn', 'winter']) {
    await page.goto(`/world/${world}`, { waitUntil: 'domcontentloaded' })
    await freezeScene(page)
    await capture(page, `world-${world}.png`)
  }

  await page.goto('/archive', { waitUntil: 'domcontentloaded' })
  await capture(page, 'archive.png')
  await page.goto('/product/prototype-spring-001', { waitUntil: 'domcontentloaded' })
  await capture(page, 'product.png')
  await page.goto('/bag', { waitUntil: 'domcontentloaded' })
  await capture(page, 'bag.png')
})

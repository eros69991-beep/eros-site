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
  await page.waitForTimeout(150)
}

async function capture(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, {
    animations: 'disabled',
    // SwiftShader retains a small amount of sub-pixel shader variance even
    // with the scene clock and pointer position frozen.  0.1% still catches
    // real composition, color, and layout changes.
    maxDiffPixelRatio: 0.001,
    timeout: 15_000,
  })
}

test('stable visual reference states @visual', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await freezeScene(page)
  await capture(page, 'home.png')

  for (const world of ['spring', 'summer', 'autumn', 'winter']) {
    await page.goto(`/world/${world}`, { waitUntil: 'domcontentloaded' })
    await freezeScene(page)
    await capture(page, `world-${world}.png`)
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await freezeScene(page)
  await page.getByRole('button', { name: 'MENU' }).click()
  await capture(page, 'world-gate.png')

  await page.goto('/archive', { waitUntil: 'domcontentloaded' })
  await capture(page, 'archive.png')
  await page.goto('/product/prototype-spring-001', { waitUntil: 'domcontentloaded' })
  await capture(page, 'product.png')
  await page.goto('/bag', { waitUntil: 'domcontentloaded' })
  await capture(page, 'bag.png')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await freezeScene(page)
  await capture(page, 'reduced-motion.png')

  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await capture(page, 'static-fallback.png')
})

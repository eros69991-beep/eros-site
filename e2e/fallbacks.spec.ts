import { expect, test } from '@playwright/test'

test('reduced motion retains complete semantic World navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: '03 / AUTUMN / FADE' }).click()
  await expect(page).toHaveURL('/world/autumn')
  await expect(page.getByRole('heading', { name: 'AUTUMN / FADE' })).toBeVisible()
})

test('no WebGL renders the static Universe and preserves navigation', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Static universe' })).toBeVisible()
  await page.getByRole('link', { name: '01 / SPRING / AWAKENING' }).click()
  await expect(page).toHaveURL('/world/spring')
})

test('a development scene error preserves route content and offers a static continuation', async ({ page }) => {
  await page.goto('/world/summer')
  await page.waitForFunction(() => typeof window.__EROS_TEST_API__?.triggerSceneError === 'function')
  await page.evaluate(() => window.__EROS_TEST_API__?.triggerSceneError?.())
  await expect(page.getByRole('heading', { name: 'The semantic site remains available.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'SUMMER / BURN' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue with static visuals' }).click()
  await expect(page.getByRole('region', { name: 'Static universe' })).toBeVisible()
})

test('production preview does not expose development scene controls @production', async ({ page }) => {
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => window.__EROS_TEST_API__?.triggerSceneError === undefined)).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__EROS_TEST_API__?.setSceneTime === undefined)).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__EROS_HOME_TEST_API__ === undefined)).toBe(true)
})

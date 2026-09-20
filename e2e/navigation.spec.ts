import { expect, test } from '@playwright/test'

// Navigation assertions exercise the semantic layer.  Keeping these contexts
// static avoids exhausting SwiftShader's WebGL context limit during the serial
// matrix; the visual suite separately verifies frozen realtime scene states.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
})

const worlds = [
  { control: '01 / SPRING / AWAKENING', heading: 'SPRING / AWAKENING', route: '/world/spring' },
  { control: '02 / SUMMER / BURN', heading: 'SUMMER / BURN', route: '/world/summer' },
  { control: '03 / AUTUMN / FADE', heading: 'AUTUMN / FADE', route: '/world/autumn' },
  { control: '04 / WINTER / FREEZE', heading: 'WINTER / FREEZE', route: '/world/winter' },
]

for (const world of worlds) {
  test(`Home enters ${world.heading} with one link activation`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: world.control }).click()
    await expect(page).toHaveURL(world.route)
    await expect(page.getByRole('heading', { level: 1, name: world.heading })).toBeVisible()
  })
}

test('rapid Home selection commits only the final World', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'MENU' }).click()
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('button')]
    buttons.find((button) => button.textContent === 'SPRING')?.click()
    buttons.find((button) => button.textContent === 'WINTER')?.click()
  })

  await expect(page).toHaveURL('/world/winter')
})

test('keyboard-only World Gate closes and restores focus to MENU', async ({ page }) => {
  await page.goto('/world/summer')
  const menu = page.getByRole('button', { name: 'MENU' })
  await menu.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'World Gate' })).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'World Gate' })).toBeHidden()
  await expect(menu).toBeFocused()
})

test('World Product Back restores the originating Object focus and scroll position', async ({ page }) => {
  await page.goto('/world/spring')
  const object = page.getByRole('link', { name: /View Mist Shell, PROTOTYPE 001/i })
  await object.scrollIntoViewIfNeeded()
  await object.focus()
  const before = await page.evaluate(() => window.scrollY)
  await object.click()
  await expect(page).toHaveURL('/product/prototype-spring-001')
  await page.goBack()
  await expect(page).toHaveURL('/world/spring')
  await expect(object).toBeFocused()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(before, 2)
})

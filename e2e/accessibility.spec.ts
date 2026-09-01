import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const routes = [
  '/',
  '/world/spring',
  '/world/summer',
  '/world/autumn',
  '/world/winter',
  '/archive',
  '/product/prototype-spring-001',
  '/search?q=mist',
  '/bag',
  '/studio',
]

async function expectNoSeriousOrCriticalViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  const failures = results.violations.filter((violation) => (
    violation.impact === 'serious' || violation.impact === 'critical'
  ))
  expect(failures).toEqual([])
}

test('all primary semantic surfaces have no serious or critical axe violations', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  for (const route of routes) {
    await page.goto(route)
    await expectNoSeriousOrCriticalViolations(page)
  }
  await page.goto('/')
  await page.getByRole('button', { name: 'MENU' }).click()
  await expectNoSeriousOrCriticalViolations(page)
})

test('the static fallback has no serious or critical axe violations', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  await page.goto('/')
  await expectNoSeriousOrCriticalViolations(page)
})

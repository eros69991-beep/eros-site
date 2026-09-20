import { expect, test } from '@playwright/test'

// Commerce assertions target the React semantic layer and local persistence.
// The realtime renderer is covered separately by frozen visual projects; using
// the static path here prevents SwiftShader context exhaustion across the
// serial commerce matrix.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
})

test('World Product size selection adds a demonstration Object to the local Bag', async ({ page }) => {
  await page.goto('/world/spring')
  await page.getByRole('link', { name: /View Mist Shell, PROTOTYPE 001/i }).click()
  await page.getByRole('radio', { name: 'M' }).check()
  const addToBag = page.getByRole('button', { name: 'Add to Bag' })
  await addToBag.scrollIntoViewIfNeeded()
  await addToBag.click()
  await expect(page.getByText('Added to Bag.')).toBeVisible()
  await page.getByRole('link', { name: /BAG 1/i }).click()
  await expect(page.getByRole('heading', { name: 'BAG' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Mist Shell' })).toBeVisible()
})

test('Menu opens Archive, applies a World filter, and reaches a Product', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'MENU' }).click()
  await page.getByRole('link', { name: 'ARCHIVE' }).click()
  const springFilter = page.getByRole('checkbox', { name: 'Spring' })
  await springFilter.click()
  await expect(springFilter).toBeChecked()
  await expect(page).toHaveURL(/world=spring/)
  await page.getByRole('link', { name: /Mist Shell/i }).click()
  await expect(page).toHaveURL('/product/prototype-spring-001')
})

test('Search Back restores the query and result surface', async ({ page }) => {
  await page.goto('/search')
  await page.getByRole('searchbox', { name: 'Search the archive' }).fill('mist')
  await page.getByRole('link', { name: 'Mist Shell' }).click()
  await expect(page).toHaveURL('/product/prototype-spring-001')
  await page.goBack()
  await expect(page).toHaveURL(/\/search\?q=mist/)
  await expect(page.getByRole('searchbox', { name: 'Search the archive' })).toHaveValue('mist')
  await expect(page.getByRole('link', { name: 'Mist Shell' })).toBeVisible()
})

test('Search overlay resolves without a nested route warning', async ({ page }) => {
  const routeWarnings: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().includes('descendant <Routes>')) {
      routeWarnings.push(message.text())
    }
  })

  await page.goto('/world/spring')
  await page.getByRole('link', { name: 'SEARCH' }).click()
  await expect(page.getByRole('searchbox', { name: 'Search the archive' })).toBeVisible()

  expect(routeWarnings).toEqual([])
})

test('refresh retains Bag contents and the most recently entered World', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: '04 / WINTER / FREEZE' }).click()
  await expect(page).toHaveURL('/world/winter')
  await page.getByRole('link', { name: /View Still Field, PROTOTYPE 007/i }).click()
  await page.getByRole('radio', { name: 'M' }).check()
  const addToBag = page.getByRole('button', { name: 'Add to Bag' })
  await addToBag.scrollIntoViewIfNeeded()
  await addToBag.click()
  await page.reload()
  await page.getByRole('link', { name: /BAG 1/i }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Still Field' })).toBeVisible()
  await page.getByRole('link', { name: 'EROS' }).click()
  await expect(page.getByRole('link', { name: '04 / WINTER / FREEZE' })).toHaveAttribute('aria-current', 'true')
})

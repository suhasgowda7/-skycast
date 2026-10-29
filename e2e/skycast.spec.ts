import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { geocodingResponse, makeForecastResponse } from '../src/test/fixtures'

async function mockApi(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => route.fulfill({ json: geocodingResponse }))
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: makeForecastResponse() }))
}

async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('search → forecast → favourite → persists after reload', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Welcome to SkyCast' })).toBeVisible()

  await page.getByRole('combobox', { name: 'Search for a city' }).fill('Berlin')
  await page.getByRole('option').first().click()

  const card = page.getByRole('region', { name: 'Berlin' })
  await expect(card.getByTestId('current-temp')).toHaveText('12°')
  await expect(page.getByRole('region', { name: /hourly forecast/i }).getByRole('listitem')).toHaveCount(24)
  await expect(page.getByText('Today')).toBeVisible()

  await card.getByRole('button', { name: 'Add Berlin to favourites' }).click()
  await page.reload()

  await expect(page.getByRole('navigation', { name: 'Favourite cities' }).getByRole('button', { name: 'Berlin', exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Berlin' }).getByTestId('current-temp')).toHaveText('12°')
})

test('keyboard-only search and unit toggle', async ({ page }) => {
  await page.goto('./')
  const search = page.getByRole('combobox', { name: 'Search for a city' })
  await search.focus()
  await page.keyboard.type('Berlin')
  await expect(page.getByRole('option')).toHaveCount(2)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('current-temp')).toHaveText('12°')

  await page.getByRole('button', { name: '°F' }).press('Enter')
  await expect(page.getByTestId('current-temp')).toHaveText('54°')
})

test('runs under the production CSP without violations', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (msg) => {
    if (/Content Security Policy/i.test(msg.text())) violations.push(msg.text())
  })
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Search for a city' }).fill('Berlin')
  await page.getByRole('option').first().click()
  await expect(page.getByTestId('current-temp')).toBeVisible()
  expect(violations).toEqual([])
})

test('a11y: empty state and loaded forecast have no serious violations', async ({ page }) => {
  await page.goto('./')
  await expectNoSeriousA11yViolations(page)

  await page.getByRole('combobox', { name: 'Search for a city' }).fill('Berlin')
  await page.getByRole('option').first().click()
  await expect(page.getByTestId('current-temp')).toBeVisible()
  await expectNoSeriousA11yViolations(page)
})

test('a11y: dark mode has no serious violations', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')
  await page.getByRole('combobox', { name: 'Search for a city' }).fill('Berlin')
  await page.getByRole('option').first().click()
  await expect(page.getByTestId('current-temp')).toBeVisible()
  await expectNoSeriousA11yViolations(page)
})

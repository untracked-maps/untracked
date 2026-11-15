import AxeBuilder from '@axe-core/playwright';
import { expect, type Route, test } from '@playwright/test';

const refuse = (route: Route): Promise<void> => route.abort();

test.beforeEach(async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', refuse);
});

test('shows the map at the root', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('region', { name: 'Map' })).toBeVisible();
});

test('declares English as the document language at the root', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('shows the map in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.getByRole('region', { name: 'Carte' })).toBeVisible();
});

test('declares French as the document language under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('switches from English to French with the language links', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('link', { name: 'Français' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('opens the page that says who sees what', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('link', { name: 'Who sees what' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who sees what');
});

test('has no detectable accessibility violation', async ({ page }) => {
  await page.goto('./');

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

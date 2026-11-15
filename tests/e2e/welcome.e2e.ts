import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('greets the world in English at the root', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello World!');
});

test('declares English as the document language at the root', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('greets the world in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour le monde !');
});

test('declares French as the document language under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('switches from English to French with the language links', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('link', { name: 'Français' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour le monde !');
});

test('has no detectable accessibility violation', async ({ page }) => {
  await page.goto('./');

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

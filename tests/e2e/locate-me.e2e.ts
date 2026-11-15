import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { refuseOpenFreeMap } from './openfreemap';

test.beforeEach(refuseOpenFreeMap);

test('marks the position of the visitor on the map', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: 'Show my position' }).click();

  await expect(page.getByRole('img', { name: 'Your position' })).toBeVisible();
});

test('tells the visitor the map is centred on them', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: 'Show my position' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'The map is centred on your position.' })).toBeVisible();
});

test('locates the visitor in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await page.getByRole('button', { name: 'Afficher ma position' }).click();

  await expect(page.getByRole('img', { name: 'Votre position' })).toBeVisible();
});

test('has no detectable accessibility violation once the visitor is located', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Show my position' }).click();

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

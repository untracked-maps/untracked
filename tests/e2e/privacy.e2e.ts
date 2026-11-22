import { expect, test } from '@playwright/test';
import { violationsOf } from './accessibility';

test('lists who sees what', async ({ page }) => {
  await page.goto('privacy');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who sees what');
});

test('lists who sees what in French', async ({ page }) => {
  await page.goto('fr/privacy');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qui voit quoi');
});

test('has no detectable accessibility violation on the privacy page', async ({ page }) => {
  await page.goto('privacy');

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

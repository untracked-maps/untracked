import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('with a French browser', () => {
  test.use({ locale: 'fr-FR' });

  test('suggests the French page on the English one', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByRole('link', { name: 'La lire en français' })).toBeVisible();
  });

  test('opens the French page from the suggestion', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('link', { name: 'La lire en français' }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour le monde !');
  });

  test('suggests nothing on the French page', async ({ page }) => {
    await page.goto('fr');

    await expect(page.getByRole('complementary')).toHaveCount(0);
  });

  test('keeps the suggestion dismissed after a reload', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Fermer' }).click();

    await page.reload();

    await expect(page.getByRole('complementary')).toHaveCount(0);
  });

  test('has no detectable accessibility violation with the suggestion shown', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('complementary').waitFor();

    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations).toEqual([]);
  });
});

test.describe('with an English browser', () => {
  test.use({ locale: 'en-GB' });

  test('suggests nothing on the English page', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByRole('complementary')).toHaveCount(0);
  });

  test('suggests the English page on the French one', async ({ page }) => {
    await page.goto('fr');

    await expect(page.getByRole('link', { name: 'Read it in English' })).toBeVisible();
  });
});

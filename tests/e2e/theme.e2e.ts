import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, type Route, test } from '@playwright/test';

const DARK_CANVAS = 'rgb(18, 18, 18)';
const LIGHT_CANVAS = 'rgb(255, 255, 255)';

const refuse = (route: Route): Promise<void> => route.abort();

const languages = (page: Page): Locator => page.getByRole('navigation', { name: 'Language' });

test.beforeEach(async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', refuse);
});

test.describe('on a device that prefers dark', () => {
  test.use({ colorScheme: 'dark' });

  test('shows the interface in dark on a first visit', async ({ page }) => {
    await page.goto('./');

    await expect(languages(page)).toHaveCSS('background-color', DARK_CANVAS);
  });

  test('shows the interface in light once the visitor chooses the light theme', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('radio', { name: 'Light' }).check();

    await expect(languages(page)).toHaveCSS('background-color', LIGHT_CANVAS);
  });
});

test.describe('on a device that prefers light', () => {
  test.use({ colorScheme: 'light' });

  test('keeps the chosen theme after a reload', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('radio', { name: 'Dark' }).check();

    await page.reload();

    await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked();
  });

  test('shows the kept theme before the app starts', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('radio', { name: 'Dark' }).check();
    await page.route('**/_app/**/*.js', refuse);

    await page.reload();

    await expect(languages(page)).toHaveCSS('background-color', DARK_CANVAS);
  });

  test('has no detectable accessibility violation in the dark theme', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('radio', { name: 'Dark' }).check();

    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations).toEqual([]);
  });
});

import { expect, type Locator, type Page, type Route, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { refuseOpenFreeMap } from './openfreemap';

const welcome = (page: Page): Locator => page.getByRole('region', { name: 'A map that does not track you' });

const refuse = (route: Route): Promise<void> => route.abort();

test.beforeEach(refuseOpenFreeMap);

test('welcomes the visitor on a first visit', async ({ page }) => {
  await page.goto('./');

  await expect(welcome(page)).toBeVisible();
});

test('welcomes the visitor in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.getByRole('region', { name: 'Une carte qui ne vous piste pas' })).toBeVisible();
});

test('opens the page that says who sees what from the welcome', async ({ page }) => {
  await page.goto('./');

  await welcome(page).getByRole('link', { name: 'Who sees what' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who sees what');
});

test('withdraws the welcome once acknowledged', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: 'Got it' }).click();

  await expect(welcome(page)).toBeHidden();
});

test('does not welcome the visitor again after a reload', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Got it' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Show my position', disabled: false }).waitFor();

  await expect(welcome(page)).toBeHidden();
});

test('welcomes the visitor before the app starts', async ({ page }) => {
  await page.route('**/_app/**/*.js', refuse);

  await page.goto('./');

  await expect(welcome(page)).toBeVisible();
});

test('does not welcome again, even before the app starts, a visitor who acknowledged it', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Got it' }).click();
  await page.route('**/_app/**/*.js', refuse);

  await page.reload();

  await expect(welcome(page)).toBeHidden();
});

test('has no detectable accessibility violation with the welcome shown on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await welcome(page).waitFor();

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

test.describe('on a 375 × 667 phone, while the map background is not responding', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('./');
    await welcome(page).waitFor();
    await page.getByText('The map background is not responding at the moment').waitFor();
  });

  test('keeps the About button wholly on screen while welcoming the visitor', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'About this map' })).toBeInViewport({ ratio: 1 });
  });

  test('has no detectable accessibility violation with the welcome shortened', async ({ page }) => {
    const violations = await violationsOf(page);

    expect(violations).toEqual([]);
  });
});

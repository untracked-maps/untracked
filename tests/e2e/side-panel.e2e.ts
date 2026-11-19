import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { refuseOpenFreeMap } from './openfreemap';

const PANEL_END = 16 + 400;

const bakeries = (page: Page): Locator => page.getByRole('region', { name: 'Bakeries' });

const panelOf = (region: Locator): Locator => region.locator('xpath=ancestor::*[contains(@class, "sheet")][1]');

const credit = (page: Page): Locator => page.getByRole('link', { name: '© OpenStreetMap' });

const bakeriesShown = async (page: Page): Promise<void> => {
  await page.goto('./#map=14/48.8566/2.3522');
  await page.getByRole('list', { name: 'Kinds of places' }).getByText('Bakeries').click();
  await expect(bakeries(page)).toContainText('25 places');
};

const leftOf = async (locator: Locator): Promise<number> => (await locator.boundingBox())?.x ?? 0;

test.use({ viewport: { width: 1280, height: 800 } });

test.beforeEach(refuseOpenFreeMap);

test('shows the places of a kind in a panel on the left, under the search field', async ({ page }) => {
  await bakeriesShown(page);

  await expect.poll(() => panelOf(bakeries(page)).boundingBox()).toMatchObject({ x: 16, y: 80, width: 400 });
});

test('gives the search field the width of the panel', async ({ page }) => {
  await page.goto('./');

  expect(await page.getByRole('search').boundingBox()).toMatchObject({ x: 16, width: 400 });
});

test('puts the kinds of places on the right of the search field', async ({ page }) => {
  await page.goto('./');

  expect(await leftOf(page.getByRole('button', { name: 'Restaurants', exact: true }))).toBeGreaterThan(PANEL_END);
});

test('moves the credit line to the right of the panel rather than under it', async ({ page }) => {
  await bakeriesShown(page);

  await expect.poll(() => leftOf(credit(page))).toBeGreaterThan(PANEL_END);
});

test('puts the credit line back on the left once the panel closes', async ({ page }) => {
  await bakeriesShown(page);
  await page.getByRole('button', { name: 'Close the list' }).click();

  await expect.poll(() => leftOf(credit(page))).toBeLessThan(PANEL_END);
});

test('leaves the round buttons where they are', async ({ page }) => {
  await bakeriesShown(page);

  const box = await page.getByRole('button', { name: 'About this map' }).boundingBox();

  expect((box?.y ?? 0) + (box?.height ?? 0)).toBe(800 - 16);
});

test('shows the spot inspected in place of the places of a kind', async ({ page }) => {
  await bakeriesShown(page);
  await page.getByRole('region', { name: 'Map' }).click({ position: { x: 800, y: 400 } });
  await page.getByRole('link', { name: 'Report', exact: true }).waitFor();

  await expect(bakeries(page)).toBeHidden();
});

test('has no detectable accessibility violation with the panel open', async ({ page }) => {
  await bakeriesShown(page);

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { refuseOpenFreeMap } from './openfreemap';

const GRAND_PALAIS = /^Grand Palais/u;

const GRAND_PALAIS_VIEW = /#map=16\.5\/48\.866\d*\/2\.312\d*$/u;

const KEPT_GRAND_PALAIS = {
  id: 'grand-palais',
  name: 'Grand Palais',
  kind: 'attraction',
  address: '3 avenue du Général Eisenhower, 75008 Paris',
  coordinates: { longitude: 2.312_48, latitude: 48.866_13 }
};

const searchField = (page: Page): Locator => page.getByRole('combobox', { name: 'Search a place' });

const recentSearches = (page: Page): Locator => page.getByRole('region', { name: 'Recent' });

const keepGrandPalais = async (page: Page): Promise<void> => {
  await page.addInitScript(
    (kept) => localStorage.setItem('untracked-maps.recent-searches', JSON.stringify(kept)),
    [KEPT_GRAND_PALAIS]
  );
};

const focusedWithGrandPalais = async (page: Page): Promise<void> => {
  await keepGrandPalais(page);
  await page.goto('./');
  await searchField(page).click();
  await recentSearches(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test('offers a place chosen earlier as soon as the field gets the focus', async ({ page }) => {
  await page.goto('./');
  await searchField(page).fill('grand palais');
  await page.getByRole('option', { name: GRAND_PALAIS }).click();
  await page.reload();

  await searchField(page).click();

  await expect(recentSearches(page).getByRole('button', { name: GRAND_PALAIS })).toBeVisible();
});

test('flies to a recent search', async ({ page }) => {
  await focusedWithGrandPalais(page);

  await recentSearches(page).getByRole('button', { name: GRAND_PALAIS }).click();

  await expect(page).toHaveURL(GRAND_PALAIS_VIEW);
});

test('clears the recent searches', async ({ page }) => {
  await focusedWithGrandPalais(page);

  await recentSearches(page).getByRole('button', { name: 'Clear' }).click();

  await expect(recentSearches(page)).toBeHidden();
});

test('closes the panel when the visitor presses the map', async ({ page }) => {
  await focusedWithGrandPalais(page);

  await page.getByRole('region', { name: 'Map', exact: true }).click({ position: { x: 200, y: 400 } });

  await expect(recentSearches(page)).toBeHidden();
});

test('has no detectable accessibility violation with recent searches offered', async ({ page }) => {
  await focusedWithGrandPalais(page);

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

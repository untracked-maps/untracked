import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { refuseOpenFreeMap } from './openfreemap';

const PLACES_FILE = '**/data/places.json';

const ORSAY = /^Musée d'Orsay/u;

const EIFFEL_TOWER = /^Tour Eiffel/u;

const GRAND_PALAIS = /^Grand Palais/u;

const GRAND_PALAIS_VIEW = /#map=16\.5\/48\.866\d*\/2\.312\d*$/u;

const SACRE_COEUR_DETAILS = /Lieu de culte · 35 rue du Chevalier de la Barre/u;

const searchField = (page: Page): Locator => page.getByRole('combobox', { name: 'Search a place' });

const searchFor = async (page: Page, query: string): Promise<void> => {
  await page.goto('./');
  await searchField(page).fill(query);
};

const placesFilesLoaded = (page: Page): Promise<number> =>
  page.evaluate(
    () =>
      performance.getEntriesByType('resource').filter(({ name }) => new URL(name).pathname.endsWith('/data/places.json')).length
  );

test.beforeEach(refuseOpenFreeMap);

test('finds the Eiffel Tower despite a typo', async ({ page }) => {
  await searchFor(page, 'tour eifel');

  await expect(page.getByRole('option', { name: EIFFEL_TOWER })).toBeVisible();
});

test('tells the visitor no place has the name', async ({ page }) => {
  await searchFor(page, 'zzzz');

  await expect(page.getByRole('status').filter({ hasText: 'No result for “zzzz”.' })).toBeVisible();
});

test('marks the place chosen with the keyboard', async ({ page }) => {
  await searchFor(page, 'musee dorsay');
  await page.getByRole('option', { name: ORSAY }).waitFor();

  await searchField(page).press('ArrowDown');
  await searchField(page).press('Enter');

  await expect(page.getByRole('img', { name: "Musée d'Orsay" })).toBeVisible();
});

test('flies to the place chosen with the pointer', async ({ page }) => {
  await searchFor(page, 'grand palais');

  await page.getByRole('option', { name: GRAND_PALAIS }).click();

  await expect(page).toHaveURL(GRAND_PALAIS_VIEW);
});

test('loads no place before the search field gets the focus', async ({ page }) => {
  await page.goto('./');
  await searchField(page).waitFor();

  expect(await placesFilesLoaded(page)).toBe(0);
});

test('loads the places once the search field gets the focus', async ({ page }) => {
  await page.goto('./');
  const loading = page.waitForRequest(PLACES_FILE);

  await page.getByRole('combobox', { name: 'Search a place', disabled: false }).focus();

  await expect(loading).resolves.toBeDefined();
});

test('searches in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await page.getByRole('combobox', { name: 'Rechercher un lieu' }).fill('sacre coeur');

  await expect(page.getByRole('option', { name: SACRE_COEUR_DETAILS })).toBeVisible();
});

test('has no detectable accessibility violation with places listed', async ({ page }) => {
  await searchFor(page, 'louvre');
  await page.getByRole('listbox', { name: 'Places found' }).waitFor();

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

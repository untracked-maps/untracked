import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { refuseOpenFreeMap } from './openfreemap';

const NOEL = /^Boulangerie Noel/u;

const BAKERIES_NEAR_YOU = /^Bakeries near you/u;

const PHARMACIES_NEAR_YOU = /^Pharmacies near you/u;

const STREET_LEVEL = /#map=16\.5\//u;

const chip = (page: Page, name: string): Locator => page.getByRole('button', { name, exact: true });

const bakeries = (page: Page): Locator => page.getByRole('region', { name: 'Bakeries' });

const searchField = (page: Page): Locator => page.getByRole('combobox', { name: 'Search a place', disabled: false });

const bakeriesShown = async (page: Page): Promise<void> => {
  await page.goto('./#map=14/48.8566/2.3522');
  await chip(page, 'Bakeries').click();
  await bakeries(page).getByRole('button', { name: NOEL }).waitFor();
};

const placesFilesRequested = (page: Page): readonly string[] => {
  const requested: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/data/places.json')) {
      requested.push(request.url());
    }
  });
  return requested;
};

test.beforeEach(refuseOpenFreeMap);

test('offers the main kinds of places under the search field', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('list', { name: 'Kinds of places' }).getByRole('button')).toHaveCount(7);
});

test('lists the 25 bakeries nearest to the centre of the map', async ({ page }) => {
  await bakeriesShown(page);

  await expect(bakeries(page).getByRole('listitem')).toHaveCount(25);
});

test('marks the bakeries on the map', async ({ page }) => {
  await bakeriesShown(page);

  await expect(page.getByRole('img', { name: 'Boulangerie Noel' })).toBeVisible();
});

test('flies to the bakery chosen', async ({ page }) => {
  await bakeriesShown(page);

  await bakeries(page).getByRole('button', { name: NOEL }).click();

  await expect(page).toHaveURL(STREET_LEVEL);
});

test('keeps the bakery chosen among the recent searches', async ({ page }) => {
  await bakeriesShown(page);
  await bakeries(page).getByRole('button', { name: NOEL }).click();

  await searchField(page).click();

  await expect(page.getByRole('region', { name: 'Recent' }).getByRole('button', { name: NOEL })).toBeVisible();
});

test('closes the list and unmarks the bakeries', async ({ page }) => {
  await bakeriesShown(page);

  await page.getByRole('button', { name: 'Close the list' }).click();

  await expect(page.getByRole('img', { name: 'Boulangerie Noel' })).toHaveCount(0);
});

test('offers the bakeries near the visitor who types "boulangerie"', async ({ page }) => {
  await page.goto('./');

  await searchField(page).fill('boulangerie');

  await expect(page.getByRole('button', { name: BAKERIES_NEAR_YOU })).toBeVisible();
});

test('lists the bakeries once the visitor chooses them in the search panel', async ({ page }) => {
  await page.goto('./');
  await searchField(page).fill('bakeries near me');

  await page.getByRole('button', { name: BAKERIES_NEAR_YOU }).click();

  await expect(bakeries(page)).toBeVisible();
});

test('loads the places once for both searches', async ({ page }) => {
  const requested = placesFilesRequested(page);
  await page.goto('./#map=14/48.8566/2.3522');
  await searchField(page).fill('louvre');
  await page.getByRole('listbox', { name: 'Places and addresses found' }).waitFor();
  await searchField(page).press('Escape');

  await chip(page, 'Bakeries').click();
  await bakeries(page).getByRole('button', { name: NOEL }).waitFor();

  expect(requested).toHaveLength(1);
});

test('names the kinds in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await chip(page, 'Boulangeries').click();

  await expect(page.getByRole('region', { name: 'Boulangeries' })).toBeVisible();
});

test('has no detectable accessibility violation with the bakeries listed', async ({ page }) => {
  await bakeriesShown(page);

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

test('has no detectable accessibility violation with a kind offered in the search panel', async ({ page }) => {
  await page.goto('./');
  await searchField(page).fill('pharmacie');
  await page.getByRole('button', { name: PHARMACIES_NEAR_YOU }).waitFor();

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { refuseOpenFreeMap } from './openfreemap';

const ADDRESSES_FILE = '**/data/addresses.json';

const MOUFFETARD = /^40 Rue Mouffetard/u;

const MOUFFETARD_VIEW = /#map=16\.5\/48\.850\d*\/2\.265\d*$/u;

const FIRST_OPTION = /-place-0$/u;

const RIVOLI = /^Rue de Rivoli Street · 75001 Paris/u;

const RIVOLI_IN_FRENCH = /^Rue de Rivoli Voie · 75001 Paris/u;

const ELEVENTH = /^Paris 11e Arrondissement/u;

const DISTRICT_VIEW = /#map=1[34](?:\.\d+)?\//u;

const DISTRICTS_FILE = '**/data/districts.json';

const searchField = (page: Page): Locator =>
  page.getByRole('combobox', { name: 'Search a place or an address', disabled: false });

const searchFor = async (page: Page, query: string): Promise<void> => {
  await page.goto('./');
  await searchField(page).fill(query);
};

test.beforeEach(refuseOpenFreeMap);

test('finds a house by its number and its street', async ({ page }) => {
  await searchFor(page, '40 rue moufetard');

  await expect(page.getByRole('option', { name: MOUFFETARD })).toHaveId(FIRST_OPTION);
});

test('tells the kind, postcode and city of an address', async ({ page }) => {
  await searchFor(page, '40 rue mouffetard');

  await expect(page.getByRole('option', { name: MOUFFETARD })).toContainText('Address · 75008 Paris');
});

test('flies to the address chosen', async ({ page }) => {
  await searchFor(page, '40 rue mouffetard');

  await page.getByRole('option', { name: MOUFFETARD }).click();

  await expect(page).toHaveURL(MOUFFETARD_VIEW);
});

test('marks the address chosen with the keyboard', async ({ page }) => {
  await searchFor(page, '40 rue mouffetard');
  await page.getByRole('option', { name: MOUFFETARD }).waitFor();

  await searchField(page).press('ArrowDown');
  await searchField(page).press('Enter');

  await expect(page.getByRole('img', { name: 'Selected spot' })).toBeVisible();
});

const mouffetardSheet = (page: Page): Locator => page.getByRole('region', { name: '40 Rue Mouffetard' });

const mouffetardChosen = async (page: Page): Promise<void> => {
  await searchFor(page, '40 rue mouffetard');
  await page.getByRole('option', { name: MOUFFETARD }).click();
};

test('opens the sheet of the address chosen, titled by its number and street', async ({ page }) => {
  await mouffetardChosen(page);

  await expect(mouffetardSheet(page)).toBeVisible();
});

test('gives the postcode and city under the address chosen', async ({ page }) => {
  await mouffetardChosen(page);

  await expect(mouffetardSheet(page).getByText('75008 Paris')).toBeVisible();
});

test('opens the sheet of the street chosen, titled by its name alone', async ({ page }) => {
  await searchFor(page, 'rue de rivoli 75001');

  await page.getByRole('option', { name: RIVOLI }).click();

  await expect(page.getByRole('region', { name: 'Rue de Rivoli' }).getByText('75001 Paris')).toBeVisible();
});

test.describe('the sheet of an address chosen', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('copies the whole address on a long press', async ({ page }) => {
    await mouffetardChosen(page);

    await mouffetardSheet(page).getByText('75008 Paris').dispatchEvent('pointerdown');

    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('40 Rue Mouffetard, 75008 Paris');
  });
});

test('keeps the address chosen among the recent searches', async ({ page }) => {
  await searchFor(page, '40 rue mouffetard');
  await page.getByRole('option', { name: MOUFFETARD }).click();
  await page.reload();

  await searchField(page).click();

  await expect(page.getByRole('region', { name: 'Recent' }).getByRole('button', { name: MOUFFETARD })).toBeVisible();
});

test('shows the whole arrondissement of a postcode', async ({ page }) => {
  await searchFor(page, '75011');

  await page.getByRole('option', { name: ELEVENTH }).click();

  await expect(page).toHaveURL(DISTRICT_VIEW);
});

const eleventhChosen = async (page: Page): Promise<void> => {
  await searchFor(page, '75011');
  await page.getByRole('option', { name: ELEVENTH }).click();
};

const eleventhSheet = (page: Page): Locator => page.getByRole('region', { name: 'Paris 11e Arrondissement' });

test('opens the sheet of the arrondissement chosen', async ({ page }) => {
  await eleventhChosen(page);

  await expect(eleventhSheet(page)).toBeVisible();
});

test('gives the city under the arrondissement chosen', async ({ page }) => {
  await eleventhChosen(page);

  await expect(eleventhSheet(page).getByText('Paris', { exact: true })).toBeVisible();
});

test('loads the outlines of the districts once one is chosen', async ({ page }) => {
  await searchFor(page, '75011');
  const loading = page.waitForRequest(DISTRICTS_FILE);

  await page.getByRole('option', { name: ELEVENTH }).click();

  await expect(loading).resolves.toBeDefined();
});

test('closes the sheet of the arrondissement with Escape', async ({ page }) => {
  await eleventhChosen(page);
  await eleventhSheet(page).waitFor();

  await page.keyboard.press('Escape');

  await expect(eleventhSheet(page)).toBeHidden();
});

test('has no detectable accessibility violation with the sheet of an arrondissement', async ({ page }) => {
  await eleventhChosen(page);
  await eleventhSheet(page).waitFor();

  expect(await violationsOf(page)).toEqual([]);
});

test('loads the addresses once the search field gets the focus', async ({ page }) => {
  await page.goto('./');
  const loading = page.waitForRequest(ADDRESSES_FILE);

  await searchField(page).focus();

  await expect(loading).resolves.toBeDefined();
});

test('searches addresses in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await page.getByRole('combobox', { name: 'Rechercher un lieu', disabled: false }).fill('rue de rivoli');

  await expect(page.getByRole('option', { name: RIVOLI_IN_FRENCH })).toHaveId(FIRST_OPTION);
});

test('has no detectable accessibility violation with addresses listed', async ({ page }) => {
  await searchFor(page, '40 rue moufetard');
  await page.getByRole('option', { name: MOUFFETARD }).waitFor();

  expect(await violationsOf(page)).toEqual([]);
});

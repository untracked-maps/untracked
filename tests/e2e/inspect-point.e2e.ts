import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { spotCard, theMap } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const ADDRESSES_FILE = '**/data/addresses.json';

const BY_THE_LOUVRE = '#map=17/48.8606/2.3377';

const NOTE_BY_THE_LOUVRE = 'https://www.openstreetmap.org/note/new#map=19/48.86060/2.33770';

const OUT_OF_THE_OUTAGE_BANNER = { position: { x: 900, y: 200 } };

const spotMark = (page: Page): Locator => page.getByRole('img', { name: 'Selected spot' });

const inspectTheCentre = async (page: Page, path = './'): Promise<void> => {
  await page.goto(`${path}${BY_THE_LOUVRE}`);
  await theMap(page).press('Enter');
};

const addressFilesLoaded = (page: Page): Promise<number> =>
  page.evaluate(
    () =>
      performance.getEntriesByType('resource').filter(({ name }) => new URL(name).pathname.endsWith('/data/addresses.json'))
        .length
  );

test.beforeEach(refuseOpenFreeMap);

test('marks the spot clicked on the map', async ({ page }) => {
  await page.goto(`./${BY_THE_LOUVRE}`);

  await theMap(page).click(OUT_OF_THE_OUTAGE_BANNER);

  await expect(spotMark(page)).toBeVisible();
});

test('opens a card about the spot pressed long', async ({ page }) => {
  await page.goto(`./${BY_THE_LOUVRE}`);

  await theMap(page).click({ ...OUT_OF_THE_OUTAGE_BANNER, button: 'right' });

  await expect(page.getByRole('button', { name: 'Close the card' })).toBeVisible();
});

test('says the address is being looked for under the title of the spot', async ({ page }) => {
  await page.route(ADDRESSES_FILE, () => undefined);

  await inspectTheCentre(page);

  await expect(page.getByRole('region', { name: 'Selected spot' })).toContainText('Address');
});

test('says no address was found near the spot', async ({ page }) => {
  await page.route(ADDRESSES_FILE, (route) => route.fulfill({ json: [] }));

  await inspectTheCentre(page);

  await expect(page.getByRole('region', { name: 'Selected spot' })).toContainText('Address not found');
});

test('says the address cannot be found, in French under /fr', async ({ page }) => {
  await page.route(ADDRESSES_FILE, (route) => route.fulfill({ json: [] }));
  await page.goto(`fr${BY_THE_LOUVRE}`);

  await page.getByRole('region', { name: 'Carte', exact: true }).press('Enter');

  await expect(page.getByRole('region', { name: 'Point sélectionné' })).toContainText('introuvable');
});

test('inspects the centre of the map with Enter', async ({ page }) => {
  await inspectTheCentre(page);

  await expect(spotCard(page)).toBeVisible();
});

test('reports a mistake at the spot on OpenStreetMap', async ({ page }) => {
  await inspectTheCentre(page);

  await expect(page.getByRole('link', { name: 'Report', exact: true })).toHaveAttribute('href', NOTE_BY_THE_LOUVRE);
});

test('removes the card with Escape', async ({ page }) => {
  await inspectTheCentre(page);
  await spotCard(page).waitFor();

  await theMap(page).press('Escape');

  await expect(spotCard(page)).not.toBeVisible();
});

test('removes the mark with the close button', async ({ page }) => {
  await inspectTheCentre(page);

  await page.getByRole('button', { name: 'Close the card' }).click();

  await expect(spotMark(page)).not.toBeVisible();
});

test('gives the focus back to the map once the card is closed', async ({ page }) => {
  await inspectTheCentre(page);

  await page.getByRole('button', { name: 'Close the card' }).click();

  await expect(theMap(page)).toBeFocused();
});

test('loads no address before a spot is inspected', async ({ page }) => {
  await page.goto('./');
  await theMap(page).waitFor();

  expect(await addressFilesLoaded(page)).toBe(0);
});

test('loads the addresses once a spot is inspected', async ({ page }) => {
  await page.goto(`./${BY_THE_LOUVRE}`);
  const loading = page.waitForRequest(ADDRESSES_FILE);

  await theMap(page).press('Enter');

  await expect(loading).resolves.toBeDefined();
});

test('inspects a spot in French under /fr', async ({ page }) => {
  await page.goto(`fr${BY_THE_LOUVRE}`);

  await page.getByRole('region', { name: 'Carte', exact: true }).press('Enter');

  await expect(page.getByRole('link', { name: 'Signaler', exact: true })).toBeVisible();
});

test('has no detectable accessibility violation with a spot inspected', async ({ page }) => {
  await inspectTheCentre(page);
  await spotCard(page).waitFor();

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

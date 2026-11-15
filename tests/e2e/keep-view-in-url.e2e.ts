import { expect, test } from '@playwright/test';

const PARIS = /\/#map=13\/48\.8566\/2\.3522$/u;
const PARIS_IN_FRENCH = /\/fr#map=13\/48\.8566\/2\.3522$/u;
const EIFFEL_TOWER_AT_16 = /#map=16\/48\.85837\/2\.29448$/u;
const EIFFEL_TOWER_AT_17 = /#map=17\/48\.85837\/2\.29448$/u;

test.beforeEach(({ page }) => page.route('https://tiles.openfreemap.org/**', (route) => route.abort()));

test('keeps the view of Paris in the URL when it opens', async ({ page }) => {
  await page.goto('./');

  await expect(page).toHaveURL(PARIS);
});

test('keeps the view in the URL of the French page', async ({ page }) => {
  await page.goto('fr');

  await expect(page).toHaveURL(PARIS_IN_FRENCH);
});

test('opens a shared link on its view, and keeps the view once zoomed in', async ({ page }) => {
  await page.goto('./#map=15/48.85837/2.29448');

  await page.getByRole('region', { name: 'Map' }).press('Equal');

  await expect(page).toHaveURL(EIFFEL_TOWER_AT_16);
});

test('reopens the same view after a reload', async ({ page }) => {
  await page.goto('./#map=15/48.85837/2.29448');
  await page.getByRole('region', { name: 'Map' }).press('Equal');
  await page.waitForURL(EIFFEL_TOWER_AT_16);

  await page.reload();
  await page.getByRole('region', { name: 'Map' }).press('Equal');

  await expect(page).toHaveURL(EIFFEL_TOWER_AT_17);
});

test('opens Paris when the link asks for a view the map cannot show', async ({ page }) => {
  await page.goto('./#map=99/48.85837/2.29448');

  await expect(page).toHaveURL(PARIS);
});

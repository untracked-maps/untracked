import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { fakeOpenData, isOpenData } from './open-data';
import { refuseOpenFreeMap } from './openfreemap';

const ORTHOPHOTOS = /^https:\/\/data[.]geopf[.]fr\/wmts[?].*LAYER=ORTHOIMAGERY[.]ORTHOPHOTOS/u;

const BIKE_LANES = /^https:\/\/data[.]geopf[.]fr\/tms\/1[.]0[.]0\/OSM[.]PISTECYCLABLE\/15\//u;

const TRANSIT_LINES = /^https:\/\/data[.]iledefrance-mobilites[.]fr\/.*traces-du-reseau-ferre-idf/u;

const mapType = (page: Page): Locator => page.getByRole('dialog', { name: 'Map type' });

const openStartedApp = async (page: Page, view = ''): Promise<void> => {
  await page.goto(`./${view}`);
  await page.getByRole('button', { name: 'Show my position', disabled: false }).waitFor();
  await page.getByRole('button', { name: 'Map type' }).click();
};

test.beforeEach(refuseOpenFreeMap);

test.beforeEach(fakeOpenData);

test('asks the open data services for nothing until the visitor turns an option on', async ({ page }) => {
  const asked: string[] = [];
  page.on('request', (request) => {
    if (isOpenData(request.url())) {
      asked.push(request.url());
    }
  });

  await openStartedApp(page);
  await page.waitForLoadState('load');

  expect(asked).toEqual([]);
});

test('fetches the aerial photos of IGN once the visitor chooses the satellite view', async ({ page }) => {
  await openStartedApp(page);
  const fetching = page.waitForRequest(ORTHOPHOTOS);

  await mapType(page).getByRole('radio', { name: 'Satellite' }).check();

  await expect(fetching).resolves.toBeTruthy();
});

test('credits IGN while the satellite view is shown', async ({ page }) => {
  await openStartedApp(page);

  await mapType(page).getByRole('radio', { name: 'Satellite' }).check();

  await expect(page.getByRole('link', { name: '© IGN BD ORTHO®' })).toBeVisible();
});

test('keeps the satellite view after a reload', async ({ page }) => {
  await openStartedApp(page);
  await mapType(page).getByRole('radio', { name: 'Satellite' }).check();

  await page.reload();
  await page.getByRole('button', { name: 'Map type' }).click();

  await expect(mapType(page).getByRole('radio', { name: 'Satellite' })).toBeChecked();
});

test('fetches the transit lines of Île-de-France Mobilités once the visitor shows them', async ({ page }) => {
  await openStartedApp(page);
  const fetching = page.waitForRequest(TRANSIT_LINES);

  await mapType(page).getByRole('checkbox', { name: 'Transit lines' }).check();

  await expect(fetching).resolves.toBeTruthy();
});

test('stops crediting Île-de-France Mobilités once the transit lines are hidden', async ({ page }) => {
  await openStartedApp(page);
  await mapType(page).getByRole('checkbox', { name: 'Transit lines' }).check();

  await mapType(page).getByRole('checkbox', { name: 'Transit lines' }).uncheck();

  await expect(page.getByRole('link', { name: '© Île-de-France Mobilités' })).toBeHidden();
});

test('fetches the bike lanes of the Géoplateforme once the visitor shows them at street level', async ({ page }) => {
  await openStartedApp(page, '#map=15/48.8606/2.3376');
  const fetching = page.waitForRequest(BIKE_LANES);

  await mapType(page).getByRole('checkbox', { name: 'Bike lanes' }).check();

  await expect(fetching).resolves.toBeTruthy();
});

test('keeps the bike lanes shown after a reload', async ({ page }) => {
  await openStartedApp(page);
  await mapType(page).getByRole('checkbox', { name: 'Bike lanes' }).check();

  await page.reload();
  await page.getByRole('button', { name: 'Map type' }).click();

  await expect(mapType(page).getByRole('checkbox', { name: 'Bike lanes' })).toBeChecked();
});

test('has no detectable accessibility violation with every option of the map type on', async ({ page }) => {
  await openStartedApp(page);
  await mapType(page).getByRole('radio', { name: 'Satellite' }).check();
  await mapType(page).getByRole('checkbox', { name: 'Transit lines' }).check();
  await mapType(page).getByRole('checkbox', { name: 'Bike lanes' }).check();

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

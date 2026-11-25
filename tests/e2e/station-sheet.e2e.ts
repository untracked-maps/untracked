import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { refuseOpenFreeMap } from './openfreemap';

const GARE_DU_NORD = './#map=16/48.88094/2.35533&place=gare-du-nord';

const EXIT_1 = /^Exit 1 ·/u;

const NORD_LINES = 'Metro 4, 5 · RER B, D · Train H, K';

const sheet = (page: Page): Locator => page.getByRole('region', { name: 'Gare du Nord' });

const departures = (page: Page): Locator => sheet(page).getByRole('region', { name: 'Next departures' });

const exits = (page: Page): Locator => sheet(page).getByRole('region', { name: 'Exits' });

const opened = async (page: Page): Promise<void> => {
  await page.goto(GARE_DU_NORD);
  await departures(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test.describe('the sheet of a station', () => {
  test('tells its passages and its exits first', async ({ page }) => {
    await opened(page);

    await expect(sheet(page).getByRole('heading', { level: 3 })).toHaveText(['Next departures', 'Exits', 'Details']);
  });

  test('tells the lines served under its name, grouped by mode', async ({ page }) => {
    await opened(page);

    await expect(sheet(page).getByText(NORD_LINES)).toBeVisible();
  });

  test('names each line for screen readers', async ({ page }) => {
    await opened(page);

    await expect(departures(page).getByRole('img', { name: 'RER B' })).toHaveCount(2);
  });

  test('shows all its exits once asked', async ({ page }) => {
    await opened(page);
    await exits(page).getByRole('button', { name: 'All exits (6)' }).click();

    await expect(exits(page).getByRole('listitem')).toHaveCount(6);
  });

  test('stays open once an exit is shown on the map', async ({ page }) => {
    await opened(page);
    await exits(page).getByRole('button', { name: EXIT_1 }).click();

    await expect(departures(page)).toBeVisible();
  });

  test('has no detectable accessibility violation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await opened(page);

    expect(await violationsOf(page)).toEqual([]);
  });
});

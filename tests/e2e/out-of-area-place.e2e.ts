import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { searchedFor } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const VERSAILLES = 'chateau-de-versailles';

const VERSAILLES_LINK = `./#map=16/48.80485/2.12036&place=${VERSAILLES}`;

const SENTENCE = 'This place is outside the cities covered by our detailed data: only the information of the map is shown.';

const SEARCH_DONE = /No result for|results? found/u;

const VERSAILLES_SUGGESTED = /Château de Versailles/u;

const versaillesSheet = (page: Page): Locator => page.getByRole('region', { name: 'Château de Versailles' });

const versaillesOpened = async (page: Page): Promise<void> => {
  await page.goto(VERSAILLES_LINK);
  await versaillesSheet(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test.describe('a link to a place out of the cities covered', () => {
  test('opens its sheet, titled with its name', async ({ page }) => {
    await versaillesOpened(page);

    await expect(versaillesSheet(page).getByRole('heading', { name: 'Château de Versailles' })).toBeVisible();
  });

  test('says that only the information of the map is shown', async ({ page }) => {
    await versaillesOpened(page);

    await expect(versaillesSheet(page).getByText(SENTENCE)).toBeVisible();
  });

  test('shows no opening hours', async ({ page }) => {
    await versaillesOpened(page);

    await expect(versaillesSheet(page).getByRole('heading', { name: 'Opening hours' })).toHaveCount(0);
  });

  test('passes the accessibility checks', async ({ page }) => {
    await versaillesOpened(page);

    expect(await violationsOf(page)).toEqual([]);
  });
});

test.describe('the search', () => {
  test('does not find a place out of the cities covered', async ({ page }) => {
    await searchedFor(page, 'Château de Versailles');
    await page.getByText(SEARCH_DONE).waitFor({ state: 'attached' });

    await expect(page.getByRole('option', { name: VERSAILLES_SUGGESTED })).toHaveCount(0);
  });
});

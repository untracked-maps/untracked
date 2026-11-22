import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { refuseOpenFreeMap } from './openfreemap';

const GRAND_PALAIS = /^Grand Palais/u;

const GRAND_PALAIS_VIEW = /#map=16\.5\//u;

const KEPT_GRAND_PALAIS = {
  id: 'grand-palais',
  name: 'Grand Palais',
  kind: 'attraction',
  address: {
    houseNumber: '3',
    street: 'Avenue du Général Eisenhower',
    postalCode: '75008',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
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

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

const cleared = async (page: Page): Promise<void> => {
  await focusedWithGrandPalais(page);
  await recentSearches(page).getByRole('button', { name: 'Clear' }).click();
};

const undo = (page: Page): Locator => page.getByRole('button', { name: 'Undo' });

const SLOWED_PLAYBACK = 0.1;

const slowedAnimations = async (page: Page): Promise<void> => {
  const devTools = await page.context().newCDPSession(page);
  await devTools.send('Animation.enable');
  await devTools.send('Animation.setPlaybackRate', { playbackRate: SLOWED_PLAYBACK });
};

test('tells the visitor the recent places are cleared, and offers to take it back', async ({ page }) => {
  await cleared(page);

  await expect(page.getByText('Recent places cleared')).toBeVisible();
});

test('puts the recent places back once the visitor takes the clearing back', async ({ page }) => {
  await cleared(page);
  await undo(page).click();
  await searchField(page).click();

  await expect(recentSearches(page).getByRole('button', { name: GRAND_PALAIS })).toBeVisible();
});

test('withdraws the notice once its action is taken', async ({ page }) => {
  await cleared(page);
  await undo(page).click();

  await expect(page.getByText('Recent places cleared')).toBeHidden();
});

test('shows the notice under the search field, covering nothing', async ({ page }) => {
  await cleared(page);

  const field = await page.getByRole('search').boundingBox();
  const notice = await page.getByText('Recent places cleared').boundingBox();

  expect(notice?.y).toBeGreaterThanOrEqual((field?.y ?? 0) + (field?.height ?? 0));
});

test('tells it in French under /fr', async ({ page }) => {
  await keepGrandPalais(page);
  await page.goto('./fr');
  await page.getByRole('combobox').click();
  await page.getByRole('button', { name: 'Effacer', exact: true }).click();

  await expect(page.getByText('Lieux récents effacés')).toBeVisible();
});

test('has no detectable accessibility violation with a notice shown', async ({ page }) => {
  await cleared(page);
  await undo(page).waitFor();

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

test('has no detectable accessibility violation with a notice shown, however slowly it appears', async ({ page }) => {
  await focusedWithGrandPalais(page);
  await slowedAnimations(page);
  await recentSearches(page).getByRole('button', { name: 'Clear' }).click();
  await undo(page).waitFor();

  expect(await violationsOf(page)).toEqual([]);
});

import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { refuseOpenFreeMap } from './openfreemap';

const NOEL = /^Boulangerie Noel/u;

const bakeries = (page: Page): Locator => page.getByRole('region', { name: 'Bakeries' });

const sheetOf = (region: Locator): Locator => region.locator('xpath=ancestor::*[contains(@class, "sheet")][1]');

const about = (page: Page): Locator => page.getByRole('button', { name: 'About this map' });

const bakeriesShown = async (page: Page): Promise<void> => {
  await page.goto('./#map=14/48.8566/2.3522');
  await page.getByRole('button', { name: 'Bakeries', exact: true }).click();
  await bakeries(page).getByRole('button', { name: NOEL }).waitFor();
};

const bottomOf = async (locator: Locator): Promise<number> => {
  const box = await locator.boundingBox();
  return (box?.y ?? 0) + (box?.height ?? 0);
};

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test.beforeEach(refuseOpenFreeMap);

test('opens the places of a kind as a peek along the bottom of a phone', async ({ page }) => {
  await bakeriesShown(page);

  await expect(sheetOf(bakeries(page))).toHaveCSS('height', '150px');
});

test('raises the round buttons 8 px above the sheet', async ({ page }) => {
  await bakeriesShown(page);

  await expect.poll(() => bottomOf(about(page))).toBe(844 - 150 - 8);
});

test('grows the sheet to all the screen but 80 px with its grip', async ({ page }) => {
  await bakeriesShown(page);
  await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

  await page.getByRole('button', { name: 'Reduce the sheet' }).waitFor();
});

test('hides the round buttons that no longer fit above a full sheet', async ({ page }) => {
  await bakeriesShown(page);
  await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

  await expect(about(page)).toBeHidden();
});

test('withdraws the welcome while a sheet is open', async ({ page }) => {
  await bakeriesShown(page);

  await expect(page.getByRole('heading', { name: 'A map that does not track you' })).toBeHidden();
});

test('puts the round buttons back once the list is closed', async ({ page }) => {
  await bakeriesShown(page);
  await page.getByRole('button', { name: 'Close the list' }).click();

  await expect.poll(() => bottomOf(about(page))).toBe(844 - 12);
});

test('names the grip in French under /fr', async ({ page }) => {
  await page.goto('./fr#map=14/48.8566/2.3522');
  await page.getByRole('button', { name: 'Boulangeries', exact: true }).click();

  await expect(page.getByRole('button', { name: 'Agrandir la fiche' })).toBeVisible();
});

test('has no detectable accessibility violation with a sheet open on a phone', async ({ page }) => {
  await bakeriesShown(page);

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

const KEPT_ORSAY = {
  id: 'orsay',
  name: 'Musée d’Orsay',
  kind: 'museum',
  address: { street: 'Rue de la Légion d’Honneur', postalCode: '75007', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.3266, latitude: 48.86 }
};

const noticeOverFullSheet = async (page: Page): Promise<void> => {
  await page.addInitScript(
    (kept) => localStorage.setItem('untracked-maps.recent-searches', JSON.stringify(kept)),
    [KEPT_ORSAY]
  );
  await page.goto('./#map=14/48.8566/2.3522');
  await page.getByRole('combobox', { name: 'Search a place', disabled: false }).click();
  await page.getByRole('region', { name: 'Recent' }).getByRole('button', { name: 'Clear' }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Bakeries', exact: true }).click();
  await bakeries(page).getByRole('button', { name: NOEL }).waitFor();
  await page.getByRole('button', { name: 'Enlarge the sheet' }).click();
  await page.getByRole('button', { name: 'Reduce the sheet' }).waitFor();
};

test('moves a notice above a sheet grown to the top, covering none of it', async ({ page }) => {
  await noticeOverFullSheet(page);

  await expect
    .poll(() => bottomOf(page.getByRole('status').filter({ hasText: 'Recent places cleared' })))
    .toBeLessThanOrEqual(80);
});

test.describe('on a short screen', () => {
  test.use({ viewport: { width: 540, height: 320 } });

  test('keeps the sheet 8 px under the room of a notice', async ({ page }) => {
    await bakeriesShown(page);

    await expect(sheetOf(bakeries(page))).toHaveCSS('height', '140px');
  });
});

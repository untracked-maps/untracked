import { expect, type Page, test } from '@playwright/test';
import { anyPlaceSheet, bakeries, bakeriesListed, louvreOpened, louvreSheet, opened } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const LOUVRE = /^Musée du Louvre/u;

const NOEL = /^Boulangerie Noel/u;

const SEARCH_IN_FRENCH = 'Rechercher un lieu';

const bakeryOpened = async (page: Page): Promise<void> => {
  await opened(page);
  await bakeriesListed(page);
  await bakeries(page).getByRole('button', { name: NOEL }).click();
  await anyPlaceSheet(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test.describe('the sheet of a place chosen in the list of a kind', () => {
  test('opens on the place chosen', async ({ page }) => {
    await bakeryOpened(page);

    await expect(anyPlaceSheet(page).getByRole('heading', { name: NOEL })).toBeVisible();
  });

  test('hides the list while it is open', async ({ page }) => {
    await bakeryOpened(page);

    await expect(bakeries(page)).toBeHidden();
  });

  test('keeps the bakeries on the map while it is open', async ({ page }) => {
    await bakeryOpened(page);

    await expect(page.locator('.search-by-type-pin')).toHaveCount(25);
  });

  test('brings the list back once closed', async ({ page }) => {
    await bakeryOpened(page);

    await page.getByRole('button', { name: 'Close the sheet' }).click();

    await expect(bakeries(page)).toBeVisible();
  });

  test('closes before the list with Escape', async ({ page }) => {
    await bakeryOpened(page);

    await page.keyboard.press('Escape');

    await expect(bakeries(page)).toBeVisible();
  });

  test('closes before the list with the back button', async ({ page }) => {
    await bakeryOpened(page);

    await page.goBack();

    await expect(bakeries(page)).toBeVisible();
  });
});

test.describe('copying the address of a place', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('puts the address shown in the clipboard', async ({ page }) => {
    await louvreOpened(page);

    await louvreSheet(page).getByText('Rue de Rivoli, 75001 Paris').dispatchEvent('pointerdown');

    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('Rue de Rivoli, 75001 Paris');
  });
});

const louvreOpenedInFrench = async (page: Page): Promise<void> => {
  await page.goto('fr#map=17/48.8606/2.3377');
  await page.getByRole('combobox', { name: SEARCH_IN_FRENCH, disabled: false }).fill('louvre');
  await page.getByRole('option', { name: LOUVRE }).click();
  await louvreSheet(page).waitFor();
};

test.describe('the sheet of a place under /fr', () => {
  test('tells the type in French', async ({ page }) => {
    await louvreOpenedInFrench(page);

    await expect(louvreSheet(page).getByText('Musée', { exact: true })).toBeVisible();
  });

  test('names the details in French', async ({ page }) => {
    await louvreOpenedInFrench(page);

    await expect(louvreSheet(page).getByRole('region', { name: 'Détails' })).toBeVisible();
  });
});

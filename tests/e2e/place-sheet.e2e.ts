import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  anyPlaceSheet,
  bakeries,
  bakeriesListed,
  louvreOpened,
  louvreSearched,
  louvreSheet,
  opened,
  placesFound,
  searchField
} from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const LOUVRE = /^Musée du Louvre/u;

test.beforeEach(refuseOpenFreeMap);

test.describe('the sheet of a place chosen in the search', () => {
  test('opens on the place chosen', async ({ page }) => {
    await louvreOpened(page);

    await expect(louvreSheet(page).getByRole('heading', { name: 'Musée du Louvre' })).toBeVisible();
  });

  test('tells the type of the place', async ({ page }) => {
    await louvreOpened(page);

    await expect(louvreSheet(page).getByText('Museum', { exact: true })).toBeVisible();
  });

  test('gives the address of the place with its city', async ({ page }) => {
    await louvreOpened(page);

    await expect(
      louvreSheet(page).getByRole('region', { name: 'Details' }).getByText('Rue de Rivoli, 75001 Paris', { exact: true })
    ).toBeVisible();
  });

  test('marks the place on the map with a large dot', async ({ page }) => {
    await louvreOpened(page);

    await expect(page.getByRole('img', { name: 'Musée du Louvre' })).toBeVisible();
  });

  test('keeps the name of the place in the search field', async ({ page }) => {
    await louvreOpened(page);

    await expect(searchField(page)).toHaveValue('Musée du Louvre');
  });

  test('closes the suggestions of the search', async ({ page }) => {
    await louvreOpened(page);

    await expect(placesFound(page)).toBeHidden();
  });
});

test.describe('the search, once a place is chosen in it', () => {
  test('clears the kind of places shown', async ({ page }) => {
    await opened(page);
    await bakeriesListed(page);
    await louvreSearched(page);

    await placesFound(page).getByRole('option', { name: LOUVRE }).click();

    await expect(bakeries(page)).toHaveCount(0);
  });
});

test.describe('the sheet of a place chosen in the search, closed', () => {
  test('goes back to the map alone', async ({ page }) => {
    await louvreOpened(page);

    await page.getByRole('button', { name: 'Close the sheet' }).click();

    await expect(anyPlaceSheet(page)).toHaveCount(0);
  });

  test('takes its large dot away', async ({ page }) => {
    await louvreOpened(page);

    await page.getByRole('button', { name: 'Close the sheet' }).click();

    await expect(page.getByRole('img', { name: 'Musée du Louvre' })).toHaveCount(0);
  });

  test('closes with Escape', async ({ page }) => {
    await louvreOpened(page);

    await page.keyboard.press('Escape');

    await expect(anyPlaceSheet(page)).toHaveCount(0);
  });

  test('closes with the back button, the visitor staying in the app', async ({ page }) => {
    await louvreOpened(page);

    await page.goBack();

    await expect(anyPlaceSheet(page)).toHaveCount(0);
  });
});

test.describe('the sheet of a place, for every visitor', () => {
  test('has no detectable accessibility violation', async ({ page }) => {
    await louvreOpened(page);

    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations).toEqual([]);
  });

  test('has no detectable accessibility violation in the dark theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await louvreOpened(page);

    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations).toEqual([]);
  });
});

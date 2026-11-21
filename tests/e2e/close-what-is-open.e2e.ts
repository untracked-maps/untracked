import { expect, type Page, test } from '@playwright/test';
import {
  about,
  BEFORE_THE_APP,
  bakeries,
  bakeriesListed,
  IN_THE_APP,
  louvreSearched,
  mapMenu,
  opened,
  placesFound,
  searchField,
  spotCard,
  spotInspected
} from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const aboutOpened = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'About this map' }).click();
  await about(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test('closes the card of a spot with the back button', async ({ page }) => {
  await spotInspected(page);

  await page.goBack();

  await expect(spotCard(page)).toBeHidden();
});

test('stays in the app when the back button closes a card', async ({ page }) => {
  await spotInspected(page);

  await page.goBack();

  await expect(page).toHaveURL(IN_THE_APP);
});

test('leaves the app with the back button once nothing is open', async ({ page }) => {
  await spotInspected(page);
  await page.goBack();
  await spotCard(page).waitFor({ state: 'hidden' });

  await page.goBack();

  await expect(page).toHaveURL(BEFORE_THE_APP);
});

test('leaves the app with the back button after a card was closed with its button', async ({ page }) => {
  await spotInspected(page);
  await page.getByRole('button', { name: 'Close the card' }).click();
  await spotCard(page).waitFor({ state: 'hidden' });

  await page.goBack();

  await expect(page).toHaveURL(BEFORE_THE_APP);
});

test('leaves the app with the back button after a card was closed with Escape', async ({ page }) => {
  await spotInspected(page);
  await page.keyboard.press('Escape');
  await spotCard(page).waitFor({ state: 'hidden' });

  await page.goBack();

  await expect(page).toHaveURL(BEFORE_THE_APP);
});

test('closes the about dialog with the back button', async ({ page }) => {
  await opened(page);
  await aboutOpened(page);

  await page.goBack();

  await expect(about(page)).toBeHidden();
});

test('closes the about dialog with the back button on the privacy page too', async ({ page }) => {
  await page.goto('privacy');
  await aboutOpened(page);

  await page.goBack();

  await expect(about(page)).toBeHidden();
});

test('closes the map menu with the back button', async ({ page }) => {
  await opened(page);
  await page.getByRole('button', { name: 'Map type' }).click();
  await mapMenu(page).waitFor();

  await page.goBack();

  await expect(mapMenu(page)).toBeHidden();
});

test('closes the list of a kind of places with the back button', async ({ page }) => {
  await opened(page);
  await bakeriesListed(page);

  await page.goBack();

  await expect(bakeries(page)).toBeHidden();
});

test('closes the places found with the back button', async ({ page }) => {
  await opened(page);
  await louvreSearched(page);

  await page.goBack();

  await expect(placesFound(page)).toBeHidden();
});

test('clears the search with the back button pressed again', async ({ page }) => {
  await opened(page);
  await louvreSearched(page);
  await page.goBack();
  await placesFound(page).waitFor({ state: 'hidden' });

  await page.goBack();

  await expect(searchField(page)).toHaveValue('');
});

import { expect, type Page, test } from '@playwright/test';
import {
  about,
  anySpotCard,
  BEFORE_THE_APP,
  bakeries,
  bakeriesListed,
  louvreSearched,
  ONE_ZOOM_CLOSER,
  opened,
  placesFound,
  spotCard,
  spotInspected,
  theMap
} from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const cardAboveTheList = async (page: Page): Promise<void> => {
  await opened(page);
  await bakeriesListed(page);
  await theMap(page).press('Enter');
  await anySpotCard(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test('closes the card of a spot before the list of a kind, with the back button', async ({ page }) => {
  await cardAboveTheList(page);

  await page.goBack();

  await expect(anySpotCard(page)).toBeHidden();
});

test('keeps the list of a kind open when the back button closes the card above it', async ({ page }) => {
  await cardAboveTheList(page);
  await page.goBack();
  await anySpotCard(page).waitFor({ state: 'hidden' });

  await expect(bakeries(page)).toBeVisible();
});

test('closes the list of a kind at the second press of the back button', async ({ page }) => {
  await cardAboveTheList(page);
  await page.goBack();
  await anySpotCard(page).waitFor({ state: 'hidden' });

  await page.goBack();

  await expect(bakeries(page)).toBeHidden();
});

test('closes the card of a spot with Escape while the visitor types in the search', async ({ page }) => {
  await spotInspected(page);
  await louvreSearched(page);

  await page.keyboard.press('Escape');

  await expect(spotCard(page)).toBeHidden();
});

test('keeps the places found when Escape closes the card above them', async ({ page }) => {
  await spotInspected(page);
  await louvreSearched(page);
  await page.keyboard.press('Escape');
  await spotCard(page).waitFor({ state: 'hidden' });

  await expect(placesFound(page)).toBeVisible();
});

test('closes the about dialog alone with Escape, above a card', async ({ page }) => {
  await spotInspected(page);
  await page.getByRole('button', { name: 'About this map' }).click();
  await about(page).waitFor();
  await page.keyboard.press('Escape');
  await about(page).waitFor({ state: 'hidden' });

  await expect(spotCard(page)).toBeVisible();
});

test('keeps the view of the map in the address after the back button', async ({ page }) => {
  await opened(page);
  await theMap(page).press('Enter');
  await spotCard(page).waitFor();
  await theMap(page).press('Equal');
  await page.waitForURL(ONE_ZOOM_CLOSER);

  await page.goBack();

  await expect(page).toHaveURL(ONE_ZOOM_CLOSER);
});

test('adds no entry to the history when the map moves', async ({ page }) => {
  await opened(page);
  await theMap(page).press('Equal');
  await page.waitForURL(ONE_ZOOM_CLOSER);

  await page.goBack();

  await expect(page).toHaveURL(BEFORE_THE_APP);
});

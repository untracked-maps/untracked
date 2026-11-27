import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { louvreOpened, louvreSheet } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const strip = (page: Page): Locator => louvreSheet(page).getByRole('list', { name: 'Photos of Musée du Louvre' });

const card = (page: Page, rank: number): Locator =>
  louvreSheet(page).getByRole('button', { name: `Photo ${rank} of 12 of Musée du Louvre` });

const viewer = (page: Page): Locator => page.getByRole('dialog', { name: 'Photos of Musée du Louvre' });

const viewerOpened = async (page: Page, rank = 1): Promise<void> => {
  await louvreOpened(page);
  await card(page, rank).click();
  await viewer(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test.describe('the photos of a place', () => {
  test('are shown side by side in its sheet', async ({ page }) => {
    await louvreOpened(page);

    await expect(strip(page).getByRole('listitem')).toHaveCount(12);
  });

  test('are images the site serves itself', async ({ page }) => {
    await louvreOpened(page);

    await expect
      .poll(() =>
        card(page, 1)
          .locator('img')
          .evaluate((image: HTMLImageElement) => image.naturalWidth)
      )
      .toBe(800);
  });

  test('open in full screen at the photo touched', async ({ page }) => {
    await viewerOpened(page, 3);

    await expect(viewer(page).getByText('3 / 12')).toBeVisible();
  });

  test('are credited as samples in full screen', async ({ page }) => {
    await viewerOpened(page);

    await expect(viewer(page).getByText('Sample image')).toBeVisible();
  });

  test('close in full screen before the sheet, with Escape', async ({ page }) => {
    await viewerOpened(page);
    await page.keyboard.press('Escape');

    await expect(louvreSheet(page)).toBeVisible();
  });

  test('close in full screen with Escape', async ({ page }) => {
    await viewerOpened(page);
    await page.keyboard.press('Escape');

    await expect(viewer(page)).toBeHidden();
  });

  test('close in full screen before the sheet, with the back button', async ({ page }) => {
    await viewerOpened(page);
    await page.goBack();
    await viewer(page).waitFor({ state: 'hidden' });

    await expect(louvreSheet(page)).toBeVisible();
  });

  test('keep the sheet accessible', async ({ page }) => {
    await louvreOpened(page);
    await strip(page).waitFor();

    expect(await violationsOf(page)).toEqual([]);
  });

  test('keep the full screen accessible', async ({ page }) => {
    await viewerOpened(page);

    expect(await violationsOf(page)).toEqual([]);
  });
});

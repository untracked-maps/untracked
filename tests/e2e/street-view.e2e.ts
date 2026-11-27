import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { louvreOpened, opened, placesFound, searchField } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const FLORE_SUGGESTED = /^Café de Flore/u;

const floreSheet = (page: Page): Locator => page.getByRole('region', { name: 'Café de Flore' });

const thumbnail = (page: Page): Locator => page.getByRole('button', { name: 'See the street view' });

const streetView = (page: Page): Locator => page.getByRole('dialog', { name: 'Street view: Café de Flore' });

const floreOpened = async (page: Page): Promise<void> => {
  await opened(page);
  await searchField(page).fill('flore');
  await placesFound(page).getByRole('option', { name: FLORE_SUGGESTED }).click();
  await floreSheet(page).waitFor();
};

const streetViewOpened = async (page: Page): Promise<void> => {
  await floreOpened(page);
  await thumbnail(page).click();
  await streetView(page).waitFor();
};

const onTheThumbnail = (marker: HTMLElement): boolean => {
  const thumb = document.querySelector('.thumb')?.getBoundingClientRect() ?? new DOMRect();
  const mark = marker.getBoundingClientRect();
  marker.style.setProperty(
    'translate',
    `${thumb.x + (thumb.width - mark.width) / 2 - mark.x}px ${thumb.y + (thumb.height - mark.height) / 2 - mark.y}px`
  );
  return document.elementFromPoint(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)?.closest('.thumb') !== null;
};

const offCentre = (pano: HTMLElement): number =>
  Math.abs(pano.scrollLeft + pano.clientWidth / 2 - pano.scrollWidth / 2) / pano.scrollWidth;

test.beforeEach(refuseOpenFreeMap);

test.describe('the shop front of a place', () => {
  test('is shown on the map with its sheet', async ({ page }) => {
    await floreOpened(page);

    await expect(thumbnail(page)).toBeVisible();
  });

  test('is cut from an image the site serves itself', async ({ page }) => {
    await floreOpened(page);

    await expect
      .poll(() =>
        thumbnail(page)
          .locator('img')
          .evaluate((image: HTMLImageElement) => image.naturalWidth)
      )
      .toBe(2000);
  });

  test('is not shown for a place without a street view', async ({ page }) => {
    await louvreOpened(page);

    await expect(thumbnail(page)).toBeHidden();
  });

  test('goes with its sheet', async ({ page }) => {
    await floreOpened(page);
    await floreSheet(page).getByRole('button', { name: 'Close the sheet' }).click();

    await expect(thumbnail(page)).toBeHidden();
  });

  test('stays above the marker of the opened place', async ({ page }) => {
    await floreOpened(page);
    await thumbnail(page).waitFor();

    expect(await page.locator('.open-place-mark').evaluate(onTheThumbnail)).toBe(true);
  });

  test('keeps the map accessible', async ({ page }) => {
    await floreOpened(page);
    await thumbnail(page).waitFor();

    expect(await violationsOf(page)).toEqual([]);
  });
});

test.describe('the street view of a place', () => {
  test('opens in full screen from its shop front', async ({ page }) => {
    await streetViewOpened(page);

    await expect(streetView(page).getByText('Street view · scroll to look around')).toBeVisible();
  });

  test('opens facing the place', async ({ page }) => {
    await streetViewOpened(page);

    await expect.poll(() => streetView(page).locator('.pano').evaluate(offCentre)).toBeLessThan(0.01);
  });

  test('is credited as a sample', async ({ page }) => {
    await streetViewOpened(page);

    await expect(streetView(page).getByText('Sample image')).toBeVisible();
  });

  test('closes before the sheet, with Escape', async ({ page }) => {
    await streetViewOpened(page);
    await page.keyboard.press('Escape');

    await expect(floreSheet(page)).toBeVisible();
  });

  test('closes with Escape', async ({ page }) => {
    await streetViewOpened(page);
    await page.keyboard.press('Escape');

    await expect(streetView(page)).toBeHidden();
  });

  test('closes before the sheet, with the back button', async ({ page }) => {
    await streetViewOpened(page);
    await page.goBack();
    await streetView(page).waitFor({ state: 'hidden' });

    await expect(floreSheet(page)).toBeVisible();
  });

  test('stays accessible', async ({ page }) => {
    await streetViewOpened(page);

    expect(await violationsOf(page)).toEqual([]);
  });
});

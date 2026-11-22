import { expect, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { anyPlaceSheet, louvreOpened, louvreSheet, spotCard, spotInspected } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const A_PLACE_AT_ZOOM_17 = /#map=17\/48\.\d{1,6}\/2\.\d{1,6}&place=[^&]+$/u;

const A_SPOT_AT_ZOOM_17 = /#map=17\/48\.\d{1,6}\/2\.\d{1,6}&point=1$/u;

const A_VIEW_ALONE = /#map=[^&]+$/u;

const ITS_VIEW = /map=[^&]+&/u;

const ANY_COPY = /copied/iu;

const BY_THE_LOUVRE = '#map=17/48.8606/2.3377';

const NOWHERE = `${BY_THE_LOUVRE}&place=nowhere`;

const RIVOLI = `${BY_THE_LOUVRE}&point=1`;

const copied = (page: Page): Promise<string> => page.evaluate(() => navigator.clipboard.readText());

const louvreLink = async (page: Page): Promise<string> => {
  await louvreOpened(page);
  await louvreSheet(page).getByRole('button', { name: 'Share' }).click();
  await expect.poll(() => copied(page)).toMatch(A_PLACE_AT_ZOOM_17);
  return copied(page);
};

const missingOpened = async (page: Page): Promise<void> => {
  await page.goto(`./${NOWHERE}`);
  await page.getByRole('heading', { name: 'Place not found' }).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test.describe('sharing, on a device without a share sheet', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('copies a link to the place at zoom 17', async ({ page }) => {
    await louvreOpened(page);

    await louvreSheet(page).getByRole('button', { name: 'Share' }).click();

    await expect.poll(() => copied(page)).toMatch(A_PLACE_AT_ZOOM_17);
  });

  test('copies a link to the address of the page', async ({ page }) => {
    const link = await louvreLink(page);

    expect(link.split('#')[0]).toBe(page.url().split('#')[0]);
  });

  test('copies a link to a spot placed by hand', async ({ page }) => {
    await spotInspected(page);

    await spotCard(page).getByRole('button', { name: 'Share' }).click();

    await expect.poll(() => copied(page)).toMatch(A_SPOT_AT_ZOOM_17);
  });

  test('says nothing once the link is copied', async ({ page }) => {
    await louvreLink(page);

    await expect(page.getByText(ANY_COPY)).toHaveCount(0);
  });
});

test.describe('a shared link to a place', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('opens the sheet of the place', async ({ page }) => {
    const link = await louvreLink(page);

    await page.goto('about:blank');
    await page.goto(link);

    await expect(louvreSheet(page).getByRole('heading', { name: 'Musée du Louvre' })).toBeVisible();
  });

  test('opens the sheet of the place without a view of the map', async ({ page }) => {
    const link = await louvreLink(page);

    await page.goto('about:blank');
    await page.goto(link.replace(ITS_VIEW, ''));

    await expect(louvreSheet(page).getByRole('heading', { name: 'Musée du Louvre' })).toBeVisible();
  });

  test('leaves the address once its sheet is closed', async ({ page }) => {
    const link = await louvreLink(page);
    await page.goto('about:blank');
    await page.goto(link);
    await louvreSheet(page).waitFor();

    await louvreSheet(page).getByRole('button', { name: 'Close the sheet' }).click();

    await expect(page).toHaveURL(A_VIEW_ALONE);
  });
});

test.describe('a place opened otherwise', () => {
  test('stays out of the address', async ({ page }) => {
    await louvreOpened(page);

    await expect(page).toHaveURL(A_VIEW_ALONE);
  });
});

test.describe('a shared link to a place that cannot be found', () => {
  test('titles its sheet "Place not found"', async ({ page }) => {
    await missingOpened(page);

    await expect(anyPlaceSheet(page).getByRole('heading', { name: 'Place not found' })).toBeVisible();
  });

  test('says why just below the title', async ({ page }) => {
    await missingOpened(page);

    await expect(
      anyPlaceSheet(page).getByText('This place cannot be found: it may have closed, or the link is incomplete.')
    ).toBeVisible();
  });

  test('marks the point of the link with a red pin', async ({ page }) => {
    await missingOpened(page);

    await expect(page.getByRole('img', { name: 'Place not found' })).toBeVisible();
  });

  test('has no detectable accessibility violation', async ({ page }) => {
    await missingOpened(page);

    expect(await violationsOf(page)).toEqual([]);
  });
});

test.describe('a shared link to a spot', () => {
  test('opens the sheet of the spot', async ({ page }) => {
    await page.goto(`./${RIVOLI}`);

    await expect(spotCard(page)).toBeVisible();
  });

  test('keeps the link in the address while the sheet stays open', async ({ page }) => {
    await page.goto(`./${RIVOLI}`);
    await spotCard(page).waitFor();

    await expect(page).toHaveURL(new RegExp(`${RIVOLI.replaceAll('.', '\\.')}$`, 'u'));
  });
});

import { expect, type Locator, type Page, test } from '@playwright/test';
import { EIFFEL_TOWER_FROM_THE_CENTRE, eiffelTowerDrawn, WEST_OF_THE_EIFFEL_TOWER } from './eiffel-tower';
import {
  bakeries,
  bakeriesAtTheCentre,
  IN_THE_APP,
  louvreOpened,
  louvreSearched,
  louvreSheet,
  opened,
  placesFound,
  theMap
} from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

type Area = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

const IN_PARIS = /#map=14\/48\.8566\/2\.3522$/u;

const FRAMES_WATCHED = 90;

const POSITIONS_OF_A_JUMP = 3;

const LOUVRE_SUGGESTED = /^Musée du Louvre/u;

const markOf = (page: Page, name: string): Locator => page.getByRole('img', { name, exact: true });

const sheetOf = (region: Locator): Locator => region.locator('xpath=ancestor-or-self::*[@data-sheet-open][1]');

const topBarBottom = async (page: Page): Promise<number> => {
  const box = await page.locator('[data-sheet-top]').boundingBox();
  return (box?.y ?? 0) + (box?.height ?? 0);
};

const aboveTheSheet = async (page: Page, region: Locator): Promise<Area> => {
  const sheet = await sheetOf(region).boundingBox();
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  return { top: await topBarBottom(page), right: width, bottom: sheet?.y ?? height, left: 0 };
};

const rightOfThePanel = async (page: Page, region: Locator): Promise<Area> => {
  const panel = await sheetOf(region).boundingBox();
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  return { top: await topBarBottom(page), right: width, bottom: height, left: (panel?.x ?? 0) + (panel?.width ?? 0) };
};

const offTheMiddle = async (mark: Locator, { top, right, bottom, left }: Area): Promise<number> => {
  const box = await mark.boundingBox();
  const x = (box?.x ?? 0) + (box?.width ?? 0) / 2;
  const y = (box?.y ?? 0) + (box?.height ?? 0) / 2;
  return Math.max(Math.abs(x - (left + right) / 2), Math.abs(y - (top + bottom) / 2));
};

const outside = async (marks: Locator, { top, right, bottom, left }: Area): Promise<number> => {
  const boxes = await Promise.all((await marks.all()).map((mark) => mark.boundingBox()));
  return boxes.filter(
    (box) => box === null || box.x < left || box.x + box.width > right || box.y < top || box.y + box.height > bottom
  ).length;
};

const bakeriesListed = async (page: Page): Promise<void> => {
  await bakeriesAtTheCentre(page);
  await expect(bakeries(page)).toContainText('25 places');
};

const eiffelTouched = async (page: Page): Promise<void> => {
  await page.goto(`./${WEST_OF_THE_EIFFEL_TOWER}`);
  await expect.poll(() => eiffelTowerDrawn(page, 0)).toBe(true);
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  await page.mouse.click(width / 2 + EIFFEL_TOWER_FROM_THE_CENTRE, height / 2);
};

const positionsSeen = (page: Page, label: string): Promise<number> =>
  page.evaluate(
    ({ name, frames }) => {
      const positionOf = (): string => {
        const box = document.querySelector(`[role="img"][aria-label="${name}"]`)?.getBoundingClientRect();
        return box === undefined ? 'none' : `${Math.round(box.x)} ${Math.round(box.y)}`;
      };
      const watched = (left: number, seen: ReadonlySet<string>): Promise<number> =>
        left === 0
          ? Promise.resolve(seen.size)
          : new Promise((resolve) => {
              requestAnimationFrame(() => resolve(watched(left - 1, new Set([...seen, positionOf()]))));
            });
      return watched(frames, new Set());
    },
    { name: label, frames: FRAMES_WATCHED }
  );

const louvreWatchedWhileChosen = async (page: Page): Promise<number> => {
  await opened(page);
  await louvreSearched(page);
  const watched = positionsSeen(page, 'Musée du Louvre');
  await placesFound(page).getByRole('option', { name: LOUVRE_SUGGESTED }).click();
  return watched;
};

type Visible = (page: Page, region: Locator) => Promise<Area>;

const louvreOffTheMiddle = (page: Page, visible: Visible) => async (): Promise<number> =>
  offTheMiddle(markOf(page, 'Musée du Louvre'), await visible(page, louvreSheet(page)));

const bakeriesOutside = (page: Page, visible: Visible) => async (): Promise<number> =>
  outside(theMap(page).locator('[data-kind]'), await visible(page, bakeries(page)));

const louvreFlown = async (page: Page): Promise<void> => {
  await louvreOpened(page);
  await page.waitForURL((url) => !IN_THE_APP.test(url.href));
};

const bakeriesFitted = async (page: Page): Promise<void> => {
  await bakeriesListed(page);
  await page.waitForURL((url) => !IN_PARIS.test(url.href));
};

test.beforeEach(refuseOpenFreeMap);

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('flies a place chosen in the search to the middle of what the top bar and its sheet leave visible', async ({ page }) => {
    await louvreFlown(page);

    await expect.poll(louvreOffTheMiddle(page, aboveTheSheet)).toBeLessThanOrEqual(1);
  });

  test('fits every place of a kind between the top bar and the sheet', async ({ page }) => {
    await bakeriesFitted(page);

    await expect.poll(bakeriesOutside(page, aboveTheSheet)).toBe(0);
  });
});

test.describe('on a large screen', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('flies a place chosen in the search to the middle of what the top bar and the side panel leave visible', async ({
    page
  }) => {
    await louvreFlown(page);

    await expect.poll(louvreOffTheMiddle(page, rightOfThePanel)).toBeLessThanOrEqual(1);
  });

  test('flies a place whose dot is touched to the middle of what is left visible', async ({ page }) => {
    await eiffelTouched(page);
    const sheet = page.getByRole('region', { name: 'Tour Eiffel' });
    await sheet.waitFor();
    await page.waitForURL((url) => !url.href.endsWith(WEST_OF_THE_EIFFEL_TOWER));

    await expect
      .poll(async () => offTheMiddle(markOf(page, 'Tour Eiffel'), await rightOfThePanel(page, sheet)))
      .toBeLessThanOrEqual(1);
  });

  test('fits every place of a kind right of the side panel', async ({ page }) => {
    await bakeriesFitted(page);

    await expect.poll(bakeriesOutside(page, rightOfThePanel)).toBe(0);
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('jumps to the place chosen instead of flying', async ({ page }) => {
    expect(await louvreWatchedWhileChosen(page)).toBeLessThanOrEqual(POSITIONS_OF_A_JUMP);
  });
});

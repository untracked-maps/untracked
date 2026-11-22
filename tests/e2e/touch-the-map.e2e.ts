import { expect, type Locator, type Page, test } from '@playwright/test';
import { EIFFEL_TOWER_FROM_THE_CENTRE, eiffelTowerDrawn } from './eiffel-tower';
import { anyPlaceSheet, anySpotCard, mapMenu } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

type Spot = {
  readonly x: number;
  readonly y: number;
};

const SOUTH_WEST_OF_THE_EIFFEL_TOWER = '#map=16.5/48.85751/2.2922';

const EIFFEL_TOWER_ABOVE_THE_CENTRE = 150;

const ON_THE_NAME = 30;

const AWAY_FROM_ANY_DOT = 150;

const eiffelSheet = (page: Page): Locator => page.getByRole('region', { name: 'Tour Eiffel' });

const centreOf = (page: Page): Spot => {
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  return { x: width / 2, y: height / 2 };
};

const eiffelTower = (page: Page, right = 0): Spot => ({
  x: centreOf(page).x + EIFFEL_TOWER_FROM_THE_CENTRE + right,
  y: centreOf(page).y - EIFFEL_TOWER_ABOVE_THE_CENTRE
});

const emptySpot = (page: Page): Spot => ({ x: centreOf(page).x, y: centreOf(page).y + AWAY_FROM_ANY_DOT });

const drawn = async (page: Page): Promise<void> => {
  await page.goto(`./${SOUTH_WEST_OF_THE_EIFFEL_TOWER}`);
  await expect.poll(() => eiffelTowerDrawn(page, EIFFEL_TOWER_ABOVE_THE_CENTRE)).toBe(true);
};

const touched = (page: Page, { x, y }: Spot): Promise<void> => page.mouse.click(x, y);

const spotOpened = async (page: Page): Promise<void> => {
  await touched(page, emptySpot(page));
  await anySpotCard(page).waitFor();
};

const eiffelOpened = async (page: Page): Promise<void> => {
  await touched(page, eiffelTower(page));
  await eiffelSheet(page).waitFor();
};

const menuOpened = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Map type' }).click();
  await mapMenu(page).waitFor();
};

test.beforeEach(refuseOpenFreeMap);

test.beforeEach(async ({ page }) => {
  await drawn(page);
});

test('opens the sheet of the place whose dot is touched', async ({ page }) => {
  await touched(page, eiffelTower(page));

  await expect(eiffelSheet(page)).toBeVisible();
});

test('opens the sheet of the place whose name is touched', async ({ page }) => {
  await touched(page, eiffelTower(page, ON_THE_NAME));

  await expect(eiffelSheet(page)).toBeVisible();
});

test('opens the sheet of an empty spot touched', async ({ page }) => {
  await touched(page, emptySpot(page));

  await expect(anySpotCard(page)).toBeVisible();
});

test('only closes the sheet of a spot when the map is touched again', async ({ page }) => {
  await spotOpened(page);

  await touched(page, emptySpot(page));

  await expect(anySpotCard(page)).toBeHidden();
});

test('only closes the sheet of a place when an empty spot is touched', async ({ page }) => {
  await eiffelOpened(page);

  await touched(page, emptySpot(page));

  await expect(anySpotCard(page)).toBeHidden();
});

test('closes the sheet of a place when an empty spot is touched', async ({ page }) => {
  await eiffelOpened(page);

  await touched(page, emptySpot(page));

  await expect(eiffelSheet(page)).toBeHidden();
});

test('opens the place of a dot touched while the sheet of a spot is open, in its place', async ({ page }) => {
  await spotOpened(page);

  await touched(page, eiffelTower(page));

  await expect(anySpotCard(page)).toBeHidden();
});

test('opens the sheet of a spot pressed long while the sheet of a place is open', async ({ page }) => {
  await eiffelOpened(page);

  await page.mouse.move(emptySpot(page).x, emptySpot(page).y);
  await page.mouse.down();
  await anySpotCard(page).waitFor();
  await page.mouse.up();

  await expect(anySpotCard(page)).toBeVisible();
});

test('closes the sheet of a place when a spot is clicked with the secondary button', async ({ page }) => {
  await eiffelOpened(page);

  await page.mouse.click(emptySpot(page).x, emptySpot(page).y, { button: 'right' });

  await expect(anyPlaceSheet(page)).toBeHidden();
});

test('only closes the menu when the map is touched while it is open', async ({ page }) => {
  await menuOpened(page);

  await touched(page, emptySpot(page));

  await expect(anySpotCard(page)).toBeHidden();
});

test('closes the menu when the map is touched while it is open', async ({ page }) => {
  await menuOpened(page);

  await touched(page, emptySpot(page));

  await expect(mapMenu(page)).toBeHidden();
});

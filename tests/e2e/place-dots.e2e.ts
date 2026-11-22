import { expect, test } from '@playwright/test';
import {
  COLOUR_OF_SIGHTS,
  differenceOnTheEiffelTower,
  INSIDE_THE_DISC,
  MOST_DIFFERENCE,
  WEST_OF_THE_EIFFEL_TOWER,
  WHITE
} from './eiffel-tower';
import { refuseOpenFreeMap } from './openfreemap';

const PLACES = /\/data\/places[.]json$/u;

test.beforeEach(refuseOpenFreeMap);

test('asks for the places as soon as the map opens', async ({ page }) => {
  const asking = page.waitForRequest(PLACES);

  await page.goto('./');

  await expect(asking).resolves.toBeTruthy();
});

test('holds the dot of each family in the sprite of the map, next to the round M of the stations', async ({ request }) => {
  const sprite = await request.get('sprites/basemap.json');

  expect(new Set(Object.keys(await sprite.json()))).toEqual(
    new Set([
      'metro',
      'place-bakery',
      'place-bar',
      'place-cafe',
      'place-culture',
      'place-food',
      'place-fuel',
      'place-health',
      'place-money',
      'place-nature',
      'place-none',
      'place-shop',
      'place-sight',
      'place-stay',
      'place-train'
    ])
  );
});

test('shows the Eiffel Tower as a dot of the colour of sights', async ({ page }) => {
  await page.goto(`./${WEST_OF_THE_EIFFEL_TOWER}`);

  await expect.poll(() => differenceOnTheEiffelTower(page, COLOUR_OF_SIGHTS, INSIDE_THE_DISC)).toBeLessThan(MOST_DIFFERENCE);
});

test('draws a white pictogram in the middle of the dot', async ({ page }) => {
  await page.goto(`./${WEST_OF_THE_EIFFEL_TOWER}`);

  await expect.poll(() => differenceOnTheEiffelTower(page, WHITE)).toBeLessThan(MOST_DIFFERENCE);
});

test.describe('in the dark theme', () => {
  test.use({ colorScheme: 'dark' });

  test('keeps the colour of the dots', async ({ page }) => {
    await page.goto(`./${WEST_OF_THE_EIFFEL_TOWER}`);

    await expect.poll(() => differenceOnTheEiffelTower(page, COLOUR_OF_SIGHTS, INSIDE_THE_DISC)).toBeLessThan(MOST_DIFFERENCE);
  });
});

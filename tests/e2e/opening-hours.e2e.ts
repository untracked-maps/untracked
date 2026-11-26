import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { louvreOpened, louvreSheet } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const A_TUESDAY_IN_PARIS = new Date('2026-11-24T11:00:00+01:00');

const openingHours = (page: Page): Locator => louvreSheet(page).getByRole('region', { name: 'Opening hours' });

test.beforeEach(async ({ page }) => {
  await refuseOpenFreeMap({ page });
  await page.clock.setFixedTime(A_TUESDAY_IN_PARIS);
});

test.describe('the opening hours of a place', () => {
  test('show its week in its sheet, from Monday to Sunday', async ({ page }) => {
    await louvreOpened(page);

    await expect(openingHours(page).getByRole('row')).toHaveText([
      'Monday9:00 – 18:00',
      'TuesdayClosed',
      'Wednesday9:00 – 21:00',
      'Thursday9:00 – 18:00',
      'Friday9:00 – 21:00',
      'Saturday9:00 – 18:00',
      'Sunday9:00 – 18:00'
    ]);
  });

  test('mark today in the week', async ({ page }) => {
    await louvreOpened(page);

    await expect(openingHours(page).locator('[aria-current="date"]')).toHaveText('TuesdayClosed');
  });

  test('come after what is good to know', async ({ page }) => {
    await louvreOpened(page);

    await expect(louvreSheet(page).getByRole('heading', { level: 3 })).toHaveText([
      'Good to know',
      'Opening hours',
      'Details',
      'About'
    ]);
  });

  test('keep the sheet accessible', async ({ page }) => {
    await louvreOpened(page);
    await openingHours(page).waitFor();

    expect(await violationsOf(page)).toEqual([]);
  });
});

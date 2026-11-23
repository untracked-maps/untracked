import { expect, type Locator, type Page, test } from '@playwright/test';
import { louvreOpened, louvreSheet } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const goodToKnow = (page: Page): Locator => louvreSheet(page).getByRole('region', { name: 'Good to know' });

test.beforeEach(refuseOpenFreeMap);

test.describe('what is good to know about a place', () => {
  test('is listed in the sheet of the place, in its order', async ({ page }) => {
    await louvreOpened(page);

    await expect(goodToKnow(page).getByRole('listitem')).toHaveText([
      'Historic monument',
      'Contactless payment',
      'Cards accepted',
      'Reservation recommended',
      'Accessible toilets',
      'Baby changing table'
    ]);
  });
});

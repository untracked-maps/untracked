import { expect, type Locator, type Page, test } from '@playwright/test';
import { louvreOpened, louvreSheet } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const about = (page: Page): Locator => louvreSheet(page).getByRole('region', { name: 'About' });

test.beforeEach(refuseOpenFreeMap);

test.describe('the text about a place', () => {
  test('comes after the details of a museum, which is expected to have opening hours', async ({ page }) => {
    await louvreOpened(page);

    await expect(louvreSheet(page).getByRole('heading', { level: 3 })).toHaveText([
      'Good to know',
      'Opening hours',
      'Details',
      'About'
    ]);
  });

  test('is written in the language of the visitor', async ({ page }) => {
    await louvreOpened(page);

    await expect(about(page)).toContainText('A former palace of the kings of France');
  });

  test('shows whole once more is asked, with nothing left to ask', async ({ page }) => {
    await louvreOpened(page);
    await about(page).getByRole('button', { name: 'More' }).click();

    await expect(about(page).getByRole('button')).toHaveCount(0);
  });
});

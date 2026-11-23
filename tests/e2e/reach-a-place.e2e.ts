import { expect, type Locator, type Page, test } from '@playwright/test';
import { louvreOpened, louvreSheet } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const call = (page: Page): Locator => louvreSheet(page).getByRole('link', { name: 'Call' });

const website = (page: Page): Locator => louvreSheet(page).getByRole('link', { name: 'Website', exact: true });

const details = (page: Page): Locator => louvreSheet(page).getByRole('region', { name: 'Details' });

const cutLabels = (page: Page): Promise<readonly string[]> =>
  louvreSheet(page)
    .locator('[data-sheet-actions] a')
    .evaluateAll((buttons) =>
      buttons.filter(({ scrollWidth, clientWidth }) => scrollWidth > clientWidth).map(({ textContent }) => textContent)
    );

test.beforeEach(refuseOpenFreeMap);

test.describe('reaching a place from its sheet', () => {
  test('calls its phone', async ({ page }) => {
    await louvreOpened(page);

    await expect(call(page)).toHaveAttribute('href', 'tel:+33199000001');
  });

  test('opens its website in a new tab', async ({ page }) => {
    await louvreOpened(page);

    await expect(website(page)).toHaveAttribute('target', '_blank');
  });

  test('names its website without www in the details', async ({ page }) => {
    await louvreOpened(page);

    await expect(details(page).getByRole('link', { name: 'louvre.example' })).toHaveAttribute(
      'href',
      'https://www.louvre.example'
    );
  });

  test('gives its Instagram account in the details', async ({ page }) => {
    await louvreOpened(page);

    await expect(details(page).getByRole('link', { name: '@museelouvre' })).toBeVisible();
  });

  test('never cuts the labels of its buttons on a narrow phone', async ({ page }) => {
    await page.setViewportSize({ width: 312, height: 640 });
    await louvreOpened(page);
    await call(page).waitFor();

    expect(await cutLabels(page)).toEqual([]);
  });
});

import { expect, test } from '@playwright/test';

test('serves a page for addresses that do not exist', async ({ page }) => {
  await page.goto('404');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});

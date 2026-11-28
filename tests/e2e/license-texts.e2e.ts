import { expect, test } from '@playwright/test';
import { refuseOpenFreeMap } from './openfreemap';

test.beforeEach(refuseOpenFreeMap);

test('opens the text of the LGPL from About', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'About this map' }).click();
  await page.getByRole('dialog', { name: 'Untracked Maps' }).getByRole('link', { name: 'License texts' }).click();

  await expect(page.locator('body')).toContainText('GNU LESSER GENERAL PUBLIC LICENSE');
});

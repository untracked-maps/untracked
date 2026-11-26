import { expect, type Locator, type Page, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { louvreOpened, louvreSearched, louvreSheet, opened, placesFound } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const LOUVRE_SUGGESTED = /^Musée du Louvre/u;

const A_TUESDAY_IN_PARIS = new Date('2026-11-24T11:00:00+01:00');

const glance = (page: Page): Locator => louvreSheet(page).getByLabel('At a glance');

const columns = (page: Page): Locator => glance(page).locator(':scope > div');

const verified = (page: Page): Locator => page.getByRole('dialog', { name: 'Verified info' });

test.beforeEach(async ({ page }) => {
  await refuseOpenFreeMap({ page });
  await page.clock.setFixedTime(A_TUESDAY_IN_PARIS);
});

test.describe('glancing at a place', () => {
  test('sums up its hours, its wheelchair access and its entrance', async ({ page }) => {
    await louvreOpened(page);

    await expect(columns(page)).toHaveText(['Opening hours Closed opens tomorrow at 9:00', 'Wheelchair Yes', 'Entrance Paid']);
  });

  test('tells how far the place is once the visitor is located', async ({ page }) => {
    await opened(page);
    await page.getByRole('button', { name: 'Show my position' }).click();
    await louvreSearched(page);
    await placesFound(page).getByRole('option', { name: LOUVRE_SUGGESTED }).click();

    await expect(columns(page).filter({ hasText: 'Distance' })).toHaveCount(1);
  });

  test('tells when its information was verified', async ({ page }) => {
    await louvreOpened(page);

    await expect(louvreSheet(page).getByText('Info verified in Oct 2026')).toBeVisible();
  });

  test('explains what verified means', async ({ page }) => {
    await louvreOpened(page);
    await louvreSheet(page).getByRole('button', { name: 'What does “verified” mean?' }).click();

    await expect(verified(page)).toBeVisible();
  });

  test('closes the explanation before the sheet', async ({ page }) => {
    await louvreOpened(page);
    await louvreSheet(page).getByRole('button', { name: 'What does “verified” mean?' }).click();
    await verified(page).waitFor();
    await page.keyboard.press('Escape');

    await expect(louvreSheet(page)).toBeVisible();
  });

  test('keeps the explanation accessible', async ({ page }) => {
    await louvreOpened(page);
    await louvreSheet(page).getByRole('button', { name: 'What does “verified” mean?' }).click();
    await verified(page).waitFor();

    expect(await violationsOf(page)).toEqual([]);
  });

  test('keeps the sheet accessible', async ({ page }) => {
    await louvreOpened(page);
    await glance(page).waitFor();

    expect(await violationsOf(page)).toEqual([]);
  });
});

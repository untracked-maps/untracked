import { expect, type Locator, type Page, test } from '@playwright/test';

const ONLY_OWN_SCRIPTS = /script-src 'self' 'sha256-/u;
const ONLY_OWN_AND_TILE_CONNECTIONS = /connect-src 'self' https:\/\/tiles[.]openfreemap[.]org(?:;|$)/u;
const NO_PLUGIN = /object-src 'none'/u;

const policy = (page: Page): Locator => page.locator('meta[http-equiv="content-security-policy"]');

test('runs only the scripts of the site', async ({ page }) => {
  await page.goto('./');

  await expect(policy(page)).toHaveAttribute('content', ONLY_OWN_SCRIPTS);
});

test('connects only to the site itself and to the OpenFreeMap tiles', async ({ page }) => {
  await page.goto('./');

  await expect(policy(page)).toHaveAttribute('content', ONLY_OWN_AND_TILE_CONNECTIONS);
});

test('loads no plugin', async ({ page }) => {
  await page.goto('./');

  await expect(policy(page)).toHaveAttribute('content', NO_PLUGIN);
});

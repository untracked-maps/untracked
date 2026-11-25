import AxeBuilder from '@axe-core/playwright';
import { expect, type Route, test } from '@playwright/test';

const TILES = 'https://tiles.openfreemap.org/**';
const TILE_DESCRIPTION = 'https://tiles.openfreemap.org/planet';
const OUTAGE_MESSAGE = 'The map background is not responding at the moment: streets and names may be missing.';

const refuse = (route: Route): Promise<void> => route.abort();

const describeTiles = (route: Route): Promise<void> =>
  route.fulfill({
    json: { tilejson: '3.0.0', tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'], minzoom: 0, maxzoom: 14 }
  });

const answerWithEmptyTiles = (route: Route): Promise<void> =>
  route.request().url() === TILE_DESCRIPTION ? describeTiles(route) : route.fulfill({ body: '' });

const refuseTiles = (route: Route): Promise<void> =>
  route.request().url() === TILE_DESCRIPTION ? describeTiles(route) : route.abort();

const BACKUP_DESCRIPTION = 'https://tiles.openfreemap.org/backup_planet';
const BACKUP_TILES = 'https://tiles.openfreemap.org/backup_planet/**/*.pbf';

const describeBackupTiles = (route: Route): Promise<void> =>
  route.fulfill({
    json: {
      tilejson: '3.0.0',
      tiles: ['https://tiles.openfreemap.org/backup_planet/{z}/{x}/{y}.pbf'],
      minzoom: 0,
      maxzoom: 14
    }
  });

const answerFromBackup = (route: Route): Promise<void> =>
  route.request().url() === BACKUP_DESCRIPTION ? describeBackupTiles(route) : route.fulfill({ body: '' });

const blockPlanetOnly = (route: Route): Promise<void> =>
  route.request().url().startsWith(BACKUP_DESCRIPTION) ? answerFromBackup(route) : route.abort('blockedbyclient');

test.describe('when OpenFreeMap refuses every request', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(TILES, refuse);
  });

  test('tells the visitor that the map background is not responding', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByRole('status').filter({ hasText: OUTAGE_MESSAGE })).toBeVisible();
  });

  test('tells the visitor in French under /fr', async ({ page }) => {
    await page.goto('fr');

    const message = 'Le fond de carte ne répond pas pour le moment : rues et noms peuvent manquer.';

    await expect(page.getByRole('status').filter({ hasText: message })).toBeVisible();
  });

  test('has no detectable accessibility violation with the message shown', async ({ page }) => {
    await page.goto('./');
    await page.getByText(OUTAGE_MESSAGE).waitFor();

    const { violations } = await new AxeBuilder({ page }).analyze();

    expect(violations).toEqual([]);
  });
});

test.describe('when a blocker refuses the OpenFreeMap planet but not its backup', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(TILES, blockPlanetOnly);
  });

  test('draws the map from the backup', async ({ page }) => {
    const backupTile = page.waitForRequest(BACKUP_TILES);
    await page.goto('./');

    expect((await backupTile).url()).toContain('/backup_planet/');
  });

  test('tells the visitor nothing', async ({ page }) => {
    const backupTile = page.waitForResponse(BACKUP_TILES);
    await page.goto('./');
    await backupTile;

    await expect(page.getByText(OUTAGE_MESSAGE)).toHaveCount(0);
  });
});

test.describe('when OpenFreeMap stops serving tiles, then serves them again', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(TILES, refuseTiles);
  });

  test('tells the visitor once tiles keep failing', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByRole('status').filter({ hasText: OUTAGE_MESSAGE })).toBeVisible();
  });

  test('withdraws the message once tiles load again', async ({ page }) => {
    await page.goto('./');
    await page.getByText(OUTAGE_MESSAGE).waitFor();
    await page.unroute(TILES);
    await page.route(TILES, answerWithEmptyTiles);

    await page.getByRole('region', { name: 'Map', exact: true }).press('-');

    await expect(page.getByText(OUTAGE_MESSAGE)).toHaveCount(0);
  });
});

import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { refuseOpenFreeMap } from './openfreemap';

const aboutButton = (page: Page): Locator => page.getByRole('button', { name: 'About this map' });

const about = (page: Page): Locator => page.getByRole('dialog', { name: 'Untracked Maps' });

const layersButton = (page: Page): Locator => page.getByRole('button', { name: 'Map type' });

const layers = (page: Page): Locator => page.getByRole('dialog', { name: 'Map type' });

const ZOOMED_IN_ON_THE_EIFFEL_TOWER = /#map=16\/48\.85837\/2\.29448$/u;

test.beforeEach(refuseOpenFreeMap);

test('shows the map at the root', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('region', { name: 'Map', exact: true })).toBeVisible();
});

test('declares English as the document language at the root', async ({ page }) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('shows the map in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.getByRole('region', { name: 'Carte', exact: true })).toBeVisible();
});

test('declares French as the document language under /fr', async ({ page }) => {
  await page.goto('fr');

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('switches from English to French with the language links', async ({ page }) => {
  await page.goto('./');

  await aboutButton(page).click();
  await about(page).getByRole('link', { name: 'Français' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('marks the language of the page as current among the language links', async ({ page }) => {
  await page.goto('fr');
  await page.getByRole('button', { name: 'À propos de cette carte' }).click();

  await expect(page.getByRole('dialog').getByRole('link', { name: 'Français' })).toHaveAttribute('aria-current', 'page');
});

test('keeps the about dialog closed at first', async ({ page }) => {
  await page.goto('./');

  await expect(about(page)).toBeHidden();
});

test('opens the about dialog with the keyboard', async ({ page }) => {
  await page.goto('./');
  await aboutButton(page).focus();

  await page.keyboard.press('Enter');

  await expect(about(page)).toBeVisible();
});

test('closes the about dialog with the Escape key', async ({ page }) => {
  await page.goto('./');
  await aboutButton(page).click();

  await page.keyboard.press('Escape');

  await expect(about(page)).toBeHidden();
});

test('gives the focus back to the about button once the dialog closes', async ({ page }) => {
  await page.goto('./');
  await aboutButton(page).click();

  await about(page).getByRole('button', { name: 'Close' }).click();

  await expect(aboutButton(page)).toBeFocused();
});

test('opens the page that says who sees what from the about dialog', async ({ page }) => {
  await page.goto('./');
  await aboutButton(page).click();

  await about(page).getByRole('link', { name: 'Who sees what' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Who sees what');
});

test('has no detectable accessibility violation', async ({ page }) => {
  await page.goto('./');

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

test('has no detectable accessibility violation with the about dialog open', async ({ page }) => {
  await page.goto('./');
  await aboutButton(page).click();

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

test('describes the about dialog with the promise of the map', async ({ page }) => {
  await page.goto('./');

  await aboutButton(page).click();

  await expect(about(page)).toHaveAccessibleDescription('A map that does not track you');
});

test('credits OpenStreetMap on the map', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('link', { name: '© OpenStreetMap', exact: true })).toBeVisible();
});

test('zooms the map in with the plus button', async ({ page }) => {
  await page.goto('./#map=15/48.85837/2.29448');

  await page.getByRole('button', { name: 'Zoom in' }).click();

  await expect(page).toHaveURL(ZOOMED_IN_ON_THE_EIFFEL_TOWER);
});

test('keeps the map type panel closed at first', async ({ page }) => {
  await page.goto('./');

  await expect(layers(page)).toBeHidden();
});

test('opens the map type panel with its theme', async ({ page }) => {
  await page.goto('./');

  await layersButton(page).click();

  await expect(layers(page).getByRole('group', { name: 'Theme' })).toBeVisible();
});

test('closes the map type panel with the Escape key', async ({ page }) => {
  await page.goto('./');
  await layersButton(page).click();

  await page.keyboard.press('Escape');

  await expect(layers(page)).toBeHidden();
});

test('closes the map type panel once the visitor clicks elsewhere', async ({ page }) => {
  await page.goto('./');
  await layersButton(page).click();

  await page.getByRole('combobox', { name: 'Search a place' }).click();

  await expect(layers(page)).toBeHidden();
});

test('has no detectable accessibility violation with the map type panel open', async ({ page }) => {
  await page.goto('./');
  await layersButton(page).click();

  const { violations } = await new AxeBuilder({ page }).analyze();

  expect(violations).toEqual([]);
});

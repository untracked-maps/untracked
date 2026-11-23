import { expect, test } from '@playwright/test';
import { violationsOf } from './accessibility';
import { searchedFor, searchField } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const ORSAY = /^Musée d'Orsay/u;

const EIFFEL_TOWER = /^Tour Eiffel/u;

const GRAND_PALAIS = /^Grand Palais/u;

const GRAND_PALAIS_VIEW = /#map=16\.5\//u;

const SACRE_COEUR_DETAILS = /Lieu de culte · 35 rue du Chevalier de la Barre/u;

test.beforeEach(refuseOpenFreeMap);

test('finds the Eiffel Tower despite a typo', async ({ page }) => {
  await searchedFor(page, 'tour eifel');

  await expect(page.getByRole('option', { name: EIFFEL_TOWER })).toBeVisible();
});

test('tells the visitor no place has the name', async ({ page }) => {
  await searchedFor(page, 'zzzz');

  await expect(page.getByRole('status').filter({ hasText: 'No result for “zzzz”.' })).toBeVisible();
});

test('marks the place chosen with the keyboard', async ({ page }) => {
  await searchedFor(page, 'musee dorsay');
  await page.getByRole('option', { name: ORSAY }).waitFor();

  await searchField(page).press('ArrowDown');
  await searchField(page).press('Enter');

  await expect(page.getByRole('img', { name: "Musée d'Orsay" })).toBeVisible();
});

test('flies to the place chosen with the pointer', async ({ page }) => {
  await searchedFor(page, 'grand palais');

  await page.getByRole('option', { name: GRAND_PALAIS }).click();

  await expect(page).toHaveURL(GRAND_PALAIS_VIEW);
});

test('searches in French under /fr', async ({ page }) => {
  await page.goto('fr');

  await page.getByRole('combobox', { name: 'Rechercher un lieu' }).fill('sacre coeur');

  await expect(page.getByRole('option', { name: SACRE_COEUR_DETAILS })).toBeVisible();
});

test('has no detectable accessibility violation with places listed', async ({ page }) => {
  await searchedFor(page, 'louvre');
  await page.getByRole('listbox', { name: 'Places and addresses found' }).waitFor();

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

test('clears the search with its button', async ({ page }) => {
  await searchedFor(page, 'grand palais');

  await page.getByRole('button', { name: 'Clear the search' }).click();

  await expect(searchField(page)).toHaveValue('');
});

test('keeps the cleared search accessible', async ({ page }) => {
  await searchedFor(page, 'grand palais');
  await page.getByRole('button', { name: 'Clear the search' }).waitFor();

  const violations = await violationsOf(page);

  expect(violations).toEqual([]);
});

import type { Locator, Page } from '@playwright/test';

const BY_THE_LOUVRE = '#map=17/48.8606/2.3377';

const IN_THE_APP: RegExp = /#map=17\/48\.8606\/2\.3377$/u;

const ONE_ZOOM_CLOSER: RegExp = /#map=18\/48\.8606\/2\.3377$/u;

const BEFORE_THE_APP: string = 'about:blank';

const NOEL = /^Boulangerie Noel/u;

const theMap = (page: Page): Locator => page.getByRole('region', { name: 'Map', exact: true });

const spotCard = (page: Page): Locator => page.getByRole('region', { name: 'Rue de Rivoli' });

const anySpotCard = (page: Page): Locator =>
  page.getByRole('region').filter({ has: page.getByRole('button', { name: 'Close the card' }) });

const bakeries = (page: Page): Locator => page.getByRole('region', { name: 'Bakeries' });

const about = (page: Page): Locator => page.getByRole('dialog', { name: 'Untracked Maps' });

const mapMenu = (page: Page): Locator => page.getByRole('dialog', { name: 'Map type' });

const searchField = (page: Page): Locator => page.getByRole('combobox', { name: 'Search a place', disabled: false });

const placesFound = (page: Page): Locator => page.getByRole('listbox', { name: 'Places and addresses found' });

const LOUVRE_SUGGESTED = /^Musée du Louvre/u;

const louvreSheet = (page: Page): Locator => page.getByRole('region', { name: 'Musée du Louvre' });

const anyPlaceSheet = (page: Page): Locator =>
  page.getByRole('region').filter({ has: page.getByRole('button', { name: 'Close the sheet' }) });

const opened = async (page: Page): Promise<void> => {
  await page.goto(`./${BY_THE_LOUVRE}`);
  await searchField(page).waitFor();
};

const spotInspected = async (page: Page): Promise<void> => {
  await opened(page);
  await theMap(page).press('Enter');
  await spotCard(page).waitFor();
};

const bakeriesListed = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Bakeries', exact: true }).click();
  await bakeries(page).getByRole('button', { name: NOEL }).waitFor();
};

const louvreSearched = async (page: Page): Promise<void> => {
  await searchField(page).fill('louvre');
  await placesFound(page).waitFor();
};

const louvreOpened = async (page: Page): Promise<void> => {
  await opened(page);
  await louvreSearched(page);
  await placesFound(page).getByRole('option', { name: LOUVRE_SUGGESTED }).click();
  await louvreSheet(page).waitFor();
};

export {
  about,
  anyPlaceSheet,
  anySpotCard,
  BEFORE_THE_APP,
  bakeries,
  bakeriesListed,
  IN_THE_APP,
  louvreOpened,
  louvreSearched,
  louvreSheet,
  mapMenu,
  ONE_ZOOM_CLOSER,
  opened,
  placesFound,
  searchField,
  spotCard,
  spotInspected,
  theMap
};

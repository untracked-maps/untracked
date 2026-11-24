import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { about, mapMenu, opened } from './home-page';
import { refuseOpenFreeMap } from './openfreemap';

const SMALL_PHONE = { width: 375, height: 667 };

type Box = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

const NOWHERE: Box = { x: -1, y: -1, width: 0, height: 0 };

const wholeOnScreen = ({ x, y, width, height }: Box): boolean =>
  x >= 0 && y >= 0 && x + width <= SMALL_PHONE.width && y + height <= SMALL_PHONE.height;

const aboutOpened = async (page: Page): Promise<void> => {
  await opened(page);
  await page.getByRole('button', { name: 'About this map' }).click();
  await about(page).waitFor();
};

const menuOpened = async (page: Page): Promise<void> => {
  await opened(page);
  await page.getByRole('button', { name: 'Map type' }).click();
  await mapMenu(page).getByRole('radio', { name: 'Satellite' }).waitFor();
};

const menuPanelBox = async (page: Page): Promise<Box> => (await page.locator('[data-menu-panel]').boundingBox()) ?? NOWHERE;

test.beforeEach(refuseOpenFreeMap);

test.use({ viewport: SMALL_PHONE });

const checkedIn = (colorScheme: 'light' | 'dark'): void =>
  test.describe(`on a small phone, in the ${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test('keeps the about window whole on screen', async ({ page }) => {
      await aboutOpened(page);

      expect(wholeOnScreen((await about(page).boundingBox()) ?? NOWHERE)).toBe(true);
    });

    test('keeps the map menu whole on screen', async ({ page }) => {
      await menuOpened(page);

      expect(wholeOnScreen(await menuPanelBox(page))).toBe(true);
    });

    test('has no detectable accessibility violation with the about window open', async ({ page }) => {
      await aboutOpened(page);

      const { violations } = await new AxeBuilder({ page }).analyze();

      expect(violations).toEqual([]);
    });

    test('has no detectable accessibility violation with the map menu open', async ({ page }) => {
      await menuOpened(page);

      const { violations } = await new AxeBuilder({ page }).analyze();

      expect(violations).toEqual([]);
    });
  });

checkedIn('light');

checkedIn('dark');

test('closes the map menu when a kind of places is touched, without reaching it', async ({ page }) => {
  await menuOpened(page);
  const pharmacies = page.getByRole('button', { name: 'Pharmacies', exact: true });
  const chip = (await pharmacies.boundingBox()) ?? NOWHERE;

  await mapMenu(page).click({ position: { x: chip.x + 4, y: chip.y + chip.height / 2 } });
  await mapMenu(page).waitFor({ state: 'hidden' });

  await expect(pharmacies).not.toBeFocused();
});

test('closes the map menu when its button is touched again', async ({ page }) => {
  await menuOpened(page);
  const button = (await page.getByRole('button', { name: 'Map type' }).boundingBox()) ?? NOWHERE;

  await mapMenu(page).click({ position: { x: button.x + button.width / 2, y: button.y + button.height / 2 } });

  await expect(mapMenu(page)).toBeHidden();
});

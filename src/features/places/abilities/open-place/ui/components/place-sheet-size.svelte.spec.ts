import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const PROCOPE: SheetPlace = {
  id: 'procope',
  name: 'Le Procope',
  kind: 'restaurant',
  address: {
    houseNumber: '13',
    street: 'Rue de l’Ancienne-Comédie',
    postalCode: '75006',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  coordinates: { longitude: 2.3388, latitude: 48.8531 }
};

const OPENED: PlaceSheet = { status: 'open', place: PROCOPE, from: 'search' };

const onSmallScreen = async (): Promise<void> => {
  await page.viewport(390, 260);
  await render(PlaceSheetCard, {
    sheet: of(OPENED),
    onClose: (): void => undefined,
    onCopy: (): void => undefined,
    vibrate: (): void => undefined
  });
};

describe('the sheet of a place on a small screen', () => {
  it('can be enlarged', async () => {
    await onSmallScreen();

    await expect.element(page.getByRole('button', { name: 'Enlarge the sheet' })).toBeVisible();
  });

  it('can be reduced once enlarged', async () => {
    await onSmallScreen();
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();

    await expect.element(page.getByRole('button', { name: 'Reduce the sheet' })).toBeVisible();
  });
});

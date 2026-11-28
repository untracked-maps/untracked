import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet, SheetPlace } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const VERSAILLES: SheetPlace = {
  id: 'versailles',
  name: 'Château de Versailles',
  kind: 'monument',
  coordinates: { longitude: 2.120_36, latitude: 48.804_85 }
};

const SENTENCE = 'This place is outside the cities covered by our detailed data: only the information of the map is shown.';

const rendered = async (sheet: PlaceSheet): Promise<void> => {
  await render(PlaceSheetCard, {
    sheet: of(sheet),
    onClose: () => undefined,
    onCopy: () => undefined,
    vibrate: () => undefined
  });
};

describe('the sheet of a place out of the cities covered', () => {
  it('says that only the information of the map is shown', async () => {
    await rendered({ status: 'open', place: VERSAILLES, from: 'link', outOfArea: true });

    await expect.element(page.getByText(SENTENCE)).toBeVisible();
  });

  it('says it last', async () => {
    await rendered({ status: 'open', place: VERSAILLES, from: 'link', outOfArea: true });

    expect(page.getByText(SENTENCE).element().nextElementSibling).toBeNull();
  });

  it('keeps the name of the place as its title', async () => {
    await rendered({ status: 'open', place: VERSAILLES, from: 'link', outOfArea: true });

    await expect.element(page.getByRole('heading', { name: 'Château de Versailles' })).toBeVisible();
  });

  it('shows no footer to correct the place', async () => {
    await rendered({ status: 'open', place: VERSAILLES, from: 'link', outOfArea: true });

    await expect.element(page.getByText('Is something missing or wrong?')).not.toBeInTheDocument();
  });
});

describe('the sheet of a place inside a city covered', () => {
  it('does not say that only the information of the map is shown', async () => {
    await rendered({ status: 'open', place: VERSAILLES, from: 'link' });

    await expect.element(page.getByText(SENTENCE)).not.toBeInTheDocument();
  });
});

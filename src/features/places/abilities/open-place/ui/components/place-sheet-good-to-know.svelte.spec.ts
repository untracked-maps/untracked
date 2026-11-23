import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { PlaceSheet } from '../../domain/open-place';
import PlaceSheetCard from './place-sheet.svelte';

const BUTTES_CHAUMONT: PlaceSheet = {
  status: 'open',
  from: 'map',
  place: {
    id: 'buttes-chaumont',
    name: 'Parc des Buttes-Chaumont',
    kind: 'park',
    website: 'https://buttes-chaumont.example',
    tags: Object.fromEntries([['dog', 'leashed']]),
    coordinates: { longitude: 2.382_67, latitude: 48.880_88 }
  }
};

const sections = (): readonly string[] =>
  [...document.querySelectorAll('section h3')].map(({ textContent }) => textContent.trim());

describe('the sheet of a place with facts good to know', () => {
  it('sets them above the details, as a shop would', async () => {
    await render(PlaceSheetCard, {
      sheet: of(BUTTES_CHAUMONT),
      onClose: (): void => undefined,
      onCopy: (): void => undefined,
      vibrate: (): void => undefined
    });

    await expect.poll(sections).toEqual(['Good to know', 'Details']);
  });
});

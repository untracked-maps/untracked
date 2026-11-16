import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Found } from '../../../../domain/found';
import type { SearchState } from '../../domain/search-places';
import SearchPlaces from './search-places.svelte';

const HERE = { longitude: 2.337_64, latitude: 48.860_61 };

const RIVOLI: Found = {
  id: 'street-75001-rue-de-rivoli',
  name: 'Rue de Rivoli',
  kind: 'street',
  address: '75001 Paris',
  coordinates: HERE
};

const SQUARE: Found = {
  id: 'square',
  name: 'Square Rivoli',
  kind: 'park',
  address: '1 Rue de Rivoli, 75001 Paris',
  coordinates: HERE,
  fame: 0
};

const STREET_OPTION = /^Rue de Rivoli/u;

const SQUARE_OPTION = /^Square Rivoli/u;

const listed = async (): Promise<void> => {
  await render(SearchPlaces, {
    state: of<SearchState>({ kind: 'found', query: 'rue de rivoli', places: [RIVOLI, SQUARE] }),
    onWake: () => undefined,
    onQuery: () => undefined,
    onChoose: () => undefined
  });
  await page.getByRole('combobox').fill('rue de rivoli');
};

describe('addresses among the search results', () => {
  it('tell their kind, postcode and city', async () => {
    await listed();

    await expect
      .element(page.getByRole('option', { name: STREET_OPTION }))
      .toHaveTextContent('Rue de Rivoli Street · 75001 Paris');
  });

  it('are marked with a signpost', async () => {
    await listed();

    expect(page.getByRole('option', { name: STREET_OPTION }).element().querySelector('path')?.getAttribute('d')).toBe(
      'M12 21V3'
    );
  });

  it('leave the pin to the places', async () => {
    await listed();

    expect(page.getByRole('option', { name: SQUARE_OPTION }).element().querySelector('circle')).not.toBeNull();
  });
});

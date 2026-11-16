import { firstValueFrom, type Observable, of, ReplaySubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Found } from '../../../../domain/found';
import type { Place } from '../../../../domain/place';
import type { SearchState } from '../../domain/search-places';
import SearchPlaces from './search-places.svelte';

const LOUVRE: Place = {
  id: 'musee-du-louvre',
  name: 'Musée du Louvre',
  kind: 'museum',
  address: 'Rue de Rivoli, 75001 Paris',
  coordinates: { longitude: 2.337_64, latitude: 48.860_61 },
  fame: 98
};

const HOTEL: Place = { ...LOUVRE, id: 'hotel-du-louvre', name: 'Hôtel du Louvre', kind: 'hotel', fame: 12 };

const MUSEUM = /^Musée du Louvre/u;

const HOTEL_OPTION = /^Hôtel du Louvre/u;

const FOUND: SearchState = { kind: 'found', query: 'louvre', places: [LOUVRE, HOTEL] };

type Seen = {
  readonly queries: ReplaySubject<string>;
  readonly chosen: ReplaySubject<Found>;
  readonly woken: ReplaySubject<true>;
};

const shown = async (state: Observable<SearchState>): Promise<Seen> => {
  const seen: Seen = { queries: new ReplaySubject(1), chosen: new ReplaySubject(1), woken: new ReplaySubject(1) };
  await render(SearchPlaces, {
    state,
    onWake: () => seen.woken.next(true),
    onQuery: (query: string) => seen.queries.next(query),
    onChoose: (place: Found) => seen.chosen.next(place)
  });
  return seen;
};

const field = (): Locator => page.getByRole('combobox', { name: 'Search a place or an address' });

const typedIn = async (state: Observable<SearchState>, text = 'louvre'): Promise<Seen> => {
  const seen = await shown(state);
  await field().fill(text);
  return seen;
};

describe('search field', () => {
  it('offers to search a place', async () => {
    await shown(of({ kind: 'idle' }));

    await expect.element(field()).toBeVisible();
  });

  it('cannot be typed in before the page is ready', async () => {
    await render(SearchPlaces, {
      state: of<SearchState>({ kind: 'idle' }),
      onWake: () => undefined,
      onQuery: () => undefined,
      onChoose: () => undefined,
      ready: false
    });

    await expect.element(field()).toBeDisabled();
  });

  it('can be typed in once the page is ready', async () => {
    await shown(of({ kind: 'idle' }));

    await expect.element(field()).toBeEnabled();
  });

  it('hints at what to type', async () => {
    await shown(of({ kind: 'idle' }));

    await expect.element(field()).toHaveAttribute('placeholder', 'Search a place or an address');
  });

  it('is collapsed before the visitor types', async () => {
    await shown(of(FOUND));

    await expect.element(field()).toHaveAttribute('aria-expanded', 'false');
  });

  it('wakes the search when it gets the focus', async () => {
    const { woken } = await shown(of({ kind: 'idle' }));

    await field().click();

    expect(await firstValueFrom(woken)).toBe(true);
  });

  it('passes on what the visitor types', async () => {
    const { queries } = await typedIn(of({ kind: 'idle' }), 'tour eif');

    expect(await firstValueFrom(queries)).toBe('tour eif');
  });

  it('says nothing before the visitor types', async () => {
    await shown(of(FOUND));

    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('search results', () => {
  it('expand once places are found', async () => {
    await typedIn(of(FOUND));

    await expect.element(field()).toHaveAttribute('aria-expanded', 'true');
  });

  it('list the names of the places found', async () => {
    await typedIn(of(FOUND));

    await expect.element(page.getByRole('option', { name: MUSEUM })).toBeVisible();
  });

  it('tell the kind and the address of each place', async () => {
    await typedIn(of(FOUND));

    await expect
      .element(page.getByRole('option', { name: HOTEL_OPTION }))
      .toHaveTextContent('Hôtel du Louvre Hotel · Rue de Rivoli, 75001 Paris');
  });

  it('are listed under a name', async () => {
    await typedIn(of(FOUND));

    await expect.element(page.getByRole('listbox', { name: 'Places and addresses found' })).toBeVisible();
  });

  it('announce how many places are found', async () => {
    await typedIn(of(FOUND));

    await expect.element(page.getByRole('status')).toHaveTextContent('2 results found.');
  });

  it('announce how many places are found without showing it over the list', async () => {
    await typedIn(of(FOUND));

    await expect.element(page.getByRole('status')).toHaveStyle({ clipPath: 'inset(50%)' });
  });

  it('announce a single place found', async () => {
    await typedIn(of({ kind: 'found', query: 'louvre', places: [LOUVRE] }));

    await expect.element(page.getByRole('status')).toHaveTextContent('1 result found.');
  });
});

describe('search status', () => {
  it('tells the visitor the search is on its way', async () => {
    await typedIn(of({ kind: 'searching', query: 'louvre' }));

    await expect.element(page.getByRole('status')).toHaveTextContent('Searching…');
  });

  it('tells the visitor no place has the name', async () => {
    await typedIn(of({ kind: 'not-found', query: 'zzz' }));

    await expect.element(page.getByRole('status')).toHaveTextContent('No result for “zzz”.');
  });

  it('tells the visitor the search is unavailable', async () => {
    await typedIn(of({ kind: 'unavailable' }));

    await expect.element(page.getByRole('status')).toHaveTextContent('Search is not available right now. Try again later.');
  });

  it('shows what it tells under the field', async () => {
    await typedIn(of({ kind: 'not-found', query: 'zzz' }));

    await expect.element(page.getByRole('status')).toBeVisible();
  });

  it('says nothing while the query is too short', async () => {
    await typedIn(of({ kind: 'idle' }), 'l');

    await expect.element(page.getByRole('status')).toBeEmptyDOMElement();
  });
});

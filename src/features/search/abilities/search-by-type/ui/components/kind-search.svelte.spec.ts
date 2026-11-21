import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Place, PlaceKind } from '../../../../domain/place';
import type { KindSearch } from '../../domain/search-by-type';
import KindSearchPanel from './kind-search.svelte';

const GARCIA: Place = {
  id: 'boulangerie-garcia',
  name: 'Boulangerie Garcia',
  kind: 'bakery',
  address: { houseNumber: '97', street: 'Rue de Paris', postalCode: '75019', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.35, latitude: 48.86 },
  fame: 0
};

const NOEL: Place = { ...GARCIA, id: 'boulangerie-noel', name: 'Boulangerie Noel' };

const FOUND: KindSearch = { status: 'found', placeKind: 'bakery', places: [GARCIA, NOEL] };

type Seen = {
  readonly events: readonly string[];
  readonly search: BehaviorSubject<KindSearch>;
};

const shown = async (initial: KindSearch = { status: 'closed' }): Promise<Seen> => {
  const events: string[] = [];
  const search = new BehaviorSubject(initial);
  await render(KindSearchPanel, {
    search,
    onChoose: (kind?: PlaceKind): void => {
      events.push(kind ?? 'closed');
    },
    onChoosePlace: (place: Place): void => {
      events.push(place.id);
    }
  });
  return { events, search };
};

const chips = (): Locator => page.getByRole('list', { name: 'Kinds of places' });

const chip = (name: string): Locator => page.getByRole('button', { name, exact: true });

const panel = (): Locator => page.getByRole('region', { name: 'Bakeries' });

const GARCIA_BUTTON = /^Boulangerie Garcia/u;

const garcia = (): Locator => page.getByRole('button', { name: GARCIA_BUTTON });

describe('chips of the main kinds', () => {
  it('offer restaurants, cafés, bakeries, pharmacies, supermarkets, bars and museums', async () => {
    await shown();

    await expect.element(chips()).toHaveTextContent('Restaurants Cafés Bakeries Pharmacies Supermarkets Bars Museums');
  });

  it('wait for the page to be ready', async () => {
    await render(KindSearchPanel, {
      search: of<KindSearch>({ status: 'closed' }),
      onChoose: () => undefined,
      onChoosePlace: () => undefined,
      ready: false
    });

    await expect.element(chip('Bakeries')).toBeDisabled();
  });

  it('are not pressed while no kind is shown', async () => {
    await shown();

    await expect.element(chip('Bakeries')).toHaveAttribute('aria-pressed', 'false');
  });

  it('show which kind is shown', async () => {
    await shown(FOUND);

    await expect.element(chip('Bakeries')).toHaveAttribute('aria-pressed', 'true');
  });

  it('choose the kind pressed', async () => {
    const { events } = await shown();

    await chip('Pharmacies').click();

    expect(events).toEqual(['pharmacy']);
  });

  it('close the kind shown when pressed again', async () => {
    const { events } = await shown(FOUND);

    await chip('Bakeries').click();

    expect(events).toEqual(['closed']);
  });
});

describe('places of the kind shown', () => {
  it('are not shown while no kind is chosen', async () => {
    await shown();

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('are listed under the name of the kind', async () => {
    await shown(FOUND);

    await expect
      .element(panel().getByRole('list'))
      .toHaveTextContent(
        'Boulangerie Garcia Bakery · 97 Rue de Paris, 75019 Paris Boulangerie Noel Bakery · 97 Rue de Paris, 75019 Paris'
      );
  });

  it('give the kind and address of each place', async () => {
    await shown(FOUND);

    await expect.element(garcia()).toHaveAccessibleName('Boulangerie Garcia Bakery · 97 Rue de Paris, 75019 Paris');
  });

  it('tell the visitor how many are found', async () => {
    await shown(FOUND);

    await expect.element(page.getByRole('status')).toHaveTextContent('2 places near the centre of the map, the nearest first.');
  });

  it('tell the visitor the search is on its way, without a list', async () => {
    await shown({ status: 'searching', placeKind: 'bakery' });

    await expect.element(panel().getByRole('list')).not.toBeInTheDocument();
  });

  it('keep the status in the page while closed, so that it is announced when it changes', async () => {
    await shown();

    await expect.element(page.getByRole('status')).toBeInTheDocument();
  });

  it('close, then fly to the place chosen', async () => {
    const { events } = await shown(FOUND);

    await garcia().click();

    expect(events).toEqual(['closed', 'boulangerie-garcia']);
  });

  it('give the focus back to the chip of the kind once a place is chosen', async () => {
    await shown(FOUND);

    await garcia().click();

    await expect.element(chip('Bakeries')).toHaveFocus();
  });
});

describe('closing the places of a kind', () => {
  it('happens once the search is closed', async () => {
    const { search } = await shown(FOUND);

    search.next({ status: 'closed' });

    await expect.element(panel()).not.toBeInTheDocument();
  });
});

import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Place } from '../../../../domain/place';
import type { CategoryKey } from '../../domain/categories';
import type { KindSearch } from '../../domain/search-by-type';
import KindSearchPanel from './kind-search.svelte';

const GARCIA: Place = {
  id: 'cafe-garcia',
  name: 'Café Garcia',
  kind: 'cafe',
  address: { houseNumber: '97', street: 'Rue de Paris', postalCode: '75019', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.35, latitude: 48.86 },
  fame: 0
};

const NOEL: Place = { ...GARCIA, id: 'cafe-noel', name: 'Café Noel' };

const FOUND: KindSearch = { status: 'found', category: 'cafes', places: [GARCIA, NOEL] };

type Seen = {
  readonly events: readonly string[];
  readonly search: BehaviorSubject<KindSearch>;
};

const shown = async (initial: KindSearch = { status: 'closed' }): Promise<Seen> => {
  const events: string[] = [];
  const search = new BehaviorSubject(initial);
  await render(KindSearchPanel, {
    search,
    onChoose: (category?: CategoryKey): void => {
      events.push(category ?? 'closed');
    },
    onChoosePlace: (place: Place): void => {
      events.push(place.id);
    }
  });
  return { events, search };
};

const chips = (): Locator => page.getByRole('list', { name: 'Kinds of places' });

const chip = (name: string): Locator => page.getByRole('button', { name, exact: true });

const panel = (): Locator => page.getByRole('region', { name: 'Cafés' });

const GARCIA_BUTTON = /^Café Garcia/u;

const garcia = (): Locator => page.getByRole('button', { name: GARCIA_BUTTON });

describe('chips of the categories', () => {
  it('offer restaurants, cafés and pharmacies, in that order', async () => {
    await shown();

    await expect.element(chips()).toHaveTextContent('Restaurants Cafés Pharmacies');
  });

  it('wait for the page to be ready', async () => {
    await render(KindSearchPanel, {
      search: of<KindSearch>({ status: 'closed' }),
      onChoose: () => undefined,
      onChoosePlace: () => undefined,
      ready: false
    });

    await expect.element(chip('Cafés')).toBeDisabled();
  });

  it('are not pressed while no category is shown', async () => {
    await shown();

    await expect.element(chip('Cafés')).toHaveAttribute('aria-pressed', 'false');
  });

  it('show which category is shown', async () => {
    await shown(FOUND);

    await expect.element(chip('Cafés')).toHaveAttribute('aria-pressed', 'true');
  });

  it('take a darker shade of the colour of the category shown', async () => {
    await shown(FOUND);

    expect(getComputedStyle(chip('Cafés').element()).backgroundColor).toBe('color(srgb 0.691451 0.345726 0.140078)');
  });

  it('write the category shown in white', async () => {
    await shown(FOUND);

    await expect.element(chip('Cafés')).toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });

  it('choose the category pressed', async () => {
    const { events } = await shown();

    await chip('Pharmacies').click();

    expect(events).toEqual(['pharmacies']);
  });

  it('close the category shown when pressed again', async () => {
    const { events } = await shown(FOUND);

    await chip('Cafés').click();

    expect(events).toEqual(['closed']);
  });
});

describe('places of the category shown', () => {
  it('are not shown while no category is chosen', async () => {
    await shown();

    await expect.element(page.getByRole('region')).not.toBeInTheDocument();
  });

  it('are listed under the name of the category', async () => {
    await shown(FOUND);

    await expect
      .element(panel().getByRole('list'))
      .toHaveTextContent('Café Garcia Café · 97 Rue de Paris, 75019 Paris Café Noel Café · 97 Rue de Paris, 75019 Paris');
  });

  it('give the kind and address of each place', async () => {
    await shown(FOUND);

    await expect.element(garcia()).toHaveAccessibleName('Café Garcia Café · 97 Rue de Paris, 75019 Paris');
  });

  it('tell the visitor how many are found', async () => {
    await shown(FOUND);

    await expect.element(page.getByRole('status')).toHaveTextContent('2 places near the centre of the map, the nearest first.');
  });

  it('tell the visitor the search is on its way, without a list', async () => {
    await shown({ status: 'searching', category: 'cafes' });

    await expect.element(panel().getByRole('list')).not.toBeInTheDocument();
  });

  it('keep the status in the page while closed, so that it is announced when it changes', async () => {
    await shown();

    await expect.element(page.getByRole('status')).toBeInTheDocument();
  });

  it('stay open under the place chosen, to come back once its sheet is closed', async () => {
    const { events } = await shown(FOUND);

    await garcia().click();

    expect(events).toEqual(['cafe-garcia']);
  });

  it('give the focus back to the chip of the category once a place is chosen', async () => {
    await shown(FOUND);

    await garcia().click();

    await expect.element(chip('Cafés')).toHaveFocus();
  });
});

describe('closing the places of a category', () => {
  it('happens once the search is closed', async () => {
    const { search } = await shown(FOUND);

    search.next({ status: 'closed' });

    await expect.element(panel()).not.toBeInTheDocument();
  });
});

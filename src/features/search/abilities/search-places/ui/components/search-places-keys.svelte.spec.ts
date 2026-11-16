import { firstValueFrom, type Observable, of, ReplaySubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Place } from '../../domain/place';
import type { SearchState } from '../../domain/search-places';
import SearchPlaces from './search-places.svelte';

const ORSAY: Place = {
  id: 'musee-d-orsay',
  name: "Musée d'Orsay",
  kind: 'museum',
  address: "1 rue de la Légion d'Honneur, 75007 Paris",
  coordinates: { longitude: 2.326_56, latitude: 48.86 },
  fame: 90
};

const FLEURS: Place = { ...ORSAY, id: 'orsay-fleurs', name: 'Orsay Fleurs', kind: 'florist', fame: 0 };

const MUSEUM = /Musée d'Orsay/u;

const FLORIST = /Orsay Fleurs/u;

const FOUND: Observable<SearchState> = of({ kind: 'found', query: 'orsay', places: [ORSAY, FLEURS] });

type Seen = {
  readonly queries: ReplaySubject<string>;
  readonly chosen: ReplaySubject<Place>;
};

const shownWithOrsay = async (): Promise<Seen> => {
  const seen: Seen = { queries: new ReplaySubject(1), chosen: new ReplaySubject(1) };
  await render(SearchPlaces, {
    state: FOUND,
    onWake: () => undefined,
    onQuery: (query: string) => seen.queries.next(query),
    onChoose: (place: Place) => seen.chosen.next(place)
  });
  await page.getByRole('combobox').fill('orsay');
  return seen;
};

const typed = async (keys: readonly string[]): Promise<Seen> => {
  const seen = await shownWithOrsay();
  await userEvent.keyboard(keys.map((key) => `{${key}}`).join(''));
  return seen;
};

describe('search keys', () => {
  it('make an option active with the down arrow', async () => {
    await typed(['ArrowDown']);

    await expect.element(page.getByRole('option', { name: MUSEUM })).toHaveAttribute('aria-selected', 'true');
  });

  it('tell assistive technologies which option is active', async () => {
    await typed(['ArrowDown', 'ArrowDown']);

    await expect
      .element(page.getByRole('combobox'))
      .toHaveAttribute('aria-activedescendant', page.getByRole('option', { name: FLORIST }).element().id);
  });

  it('leave the other options unselected', async () => {
    await typed(['ArrowUp']);

    await expect.element(page.getByRole('option', { name: MUSEUM })).toHaveAttribute('aria-selected', 'false');
  });

  it('point to no option before an arrow is pressed', async () => {
    await shownWithOrsay();

    await expect.element(page.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
  });
});

describe('search keys that choose', () => {
  it('choose the active option with Enter', async () => {
    const { chosen } = await typed(['ArrowDown', 'Enter']);

    expect(await firstValueFrom(chosen)).toBe(ORSAY);
  });

  it('leave Enter alone while no option is active', async () => {
    await typed(['Enter']);

    await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('write the name of the chosen place in the field', async () => {
    await typed(['ArrowUp', 'Enter']);

    await expect.element(page.getByRole('combobox')).toHaveValue('Orsay Fleurs');
  });

  it('search the name of the chosen place', async () => {
    const { queries } = await typed(['ArrowUp', 'Enter']);

    expect(await firstValueFrom(queries)).toBe('Orsay Fleurs');
  });

  it('collapse the list once a place is chosen', async () => {
    await typed(['ArrowDown', 'Enter']);

    await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('search keys that dismiss', () => {
  it('collapse the list with Escape', async () => {
    await typed(['Escape']);

    await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keep the text on the first Escape', async () => {
    await typed(['Escape']);

    await expect.element(page.getByRole('combobox')).toHaveValue('orsay');
  });

  it('clear the field on a second Escape', async () => {
    const { queries } = await typed(['Escape', 'Escape']);

    expect(await firstValueFrom(queries)).toBe('');
  });

  it('keep the caret at the end of the text when moving through the options', async () => {
    await typed(['ArrowUp', 'x']);

    await expect.element(page.getByRole('combobox')).toHaveValue('orsayx');
  });

  it('leave other keys to the field', async () => {
    await typed(['s']);

    await expect.element(page.getByRole('combobox')).toHaveValue('orsays');
  });
});

describe('search pointer', () => {
  it('chooses the place pressed', async () => {
    const { chosen } = await shownWithOrsay();

    await page.getByRole('option', { name: FLORIST }).click();

    expect(await firstValueFrom(chosen)).toBe(FLEURS);
  });

  it('keeps the focus in the field while a place is pressed', async () => {
    await shownWithOrsay();

    await page.getByRole('option', { name: FLORIST }).click();

    await expect.element(page.getByRole('combobox')).toHaveFocus();
  });

  it('collapses the list when the field loses the focus', async () => {
    await shownWithOrsay();

    await userEvent.tab();

    await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });
});

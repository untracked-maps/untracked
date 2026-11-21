import { firstValueFrom, type Observable, of, ReplaySubject, Subject } from 'rxjs';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { SearchState } from '../../domain/search-places';
import SearchPlaces from './search-places.svelte';

const FOUND: Observable<SearchState> = of({
  kind: 'found',
  query: 'orsay',
  places: [
    {
      id: 'orsay-fleurs',
      name: 'Orsay Fleurs',
      kind: 'florist',
      address: '3 rue de Lille, 75007 Paris',
      coordinates: { longitude: 2.33, latitude: 48.858 },
      fame: 0
    }
  ]
});

type Seen = {
  readonly queries: ReplaySubject<string>;
  readonly opens: boolean[];
  readonly closings: Subject<void>;
};

const shown = async (): Promise<Seen> => {
  const seen: Seen = { queries: new ReplaySubject(1), opens: [], closings: new Subject() };
  await render(SearchPlaces, {
    state: FOUND,
    onWake: () => undefined,
    onQuery: (query: string) => seen.queries.next(query),
    onChoose: () => undefined,
    onOpen: (open: boolean): void => {
      seen.opens.push(open);
    },
    closings: seen.closings
  });
  return seen;
};

const askedToClose = async (times: readonly unknown[]): Promise<Seen> => {
  const seen = await shown();
  await page.getByRole('combobox').fill('orsay');
  times.map(() => seen.closings.next());
  await tick();
  return seen;
};

describe('search, when asked to close', () => {
  it('collapses the list', async () => {
    await askedToClose(['once']);

    await expect.element(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the text the first time', async () => {
    await askedToClose(['once']);

    await expect.element(page.getByRole('combobox')).toHaveValue('orsay');
  });

  it('clears the field the second time', async () => {
    await askedToClose(['once', 'twice']);

    await expect.element(page.getByRole('combobox')).toHaveValue('');
  });

  it('searches nothing any more once cleared', async () => {
    const { queries } = await askedToClose(['once', 'twice']);

    expect(await firstValueFrom(queries)).toBe('');
  });
});

describe('search, telling whether it is open', () => {
  it('is closed at first', async () => {
    const { opens } = await shown();

    expect(opens).toEqual([false]);
  });

  it('is open once the visitor types', async () => {
    const { opens } = await askedToClose([]);

    expect(opens).toEqual([false, true]);
  });

  it('is open once its field is pressed', async () => {
    const { opens } = await shown();

    await page.getByRole('combobox').click();

    await expect.poll(() => opens).toEqual([false, true]);
  });

  it('tells again it is open when it is asked to close and text is left in the field', async () => {
    const { opens } = await askedToClose(['once']);

    expect(opens).toEqual([false, true, true]);
  });

  it('tells once it is closed when it is asked to close with an empty field', async () => {
    const { opens, closings } = await shown();
    await page.getByRole('combobox').click();
    closings.next();
    await tick();

    expect(opens).toEqual([false, true, false]);
  });

  it('is closed once the field is cleared', async () => {
    const { opens } = await askedToClose(['once', 'twice']);

    expect(opens).toEqual([false, true, true, false]);
  });
});

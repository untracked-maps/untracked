import { type Observable, of, Subject, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { Place } from '../../../domain/place';
import { type RecentPlace, type RecentPlaces, recentSearches, type StoreRecents } from './recent-searches';

const placeNamed = (name: string): RecentPlace & Pick<Place, 'kind'> => ({
  id: name.toLowerCase(),
  name,
  kind: 'museum',
  address: { street: name, postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: { longitude: 2.35, latitude: 48.85 }
});

const LOUVRE = placeNamed('Louvre');
const ORSAY = placeNamed('Orsay');
const FAMOUS_LOUVRE: Place = { ...LOUVRE, fame: 98 };
const NINE: RecentPlaces = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(placeNamed);
const TRATTORIA: RecentPlace = { ...placeNamed('Trattoria'), kind: 'restaurant', cuisine: 'italian' };
const CHOSEN: Readonly<Record<string, RecentPlace>> = { l: LOUVRE, o: ORSAY, f: FAMOUS_LOUVRE, t: TRATTORIA };

const storeNowhere: StoreRecents = () => of(undefined);

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

type Marbles = {
  readonly stored?: string;
  readonly chosen?: string;
  readonly cleared?: string;
  readonly restored?: string;
  readonly storeRecents?: StoreRecents;
};

type Expectation = {
  readonly toBe: (expected: string, values: Readonly<Record<string, RecentPlaces>>) => void;
};

const expectRecents = (kept: Readonly<Record<string, RecentPlaces>>, marbles: Marbles): Expectation => ({
  toBe: (expected: string, values: Readonly<Record<string, RecentPlaces>>): void =>
    new TestScheduler((actual, wanted) => expect(actual).toStrictEqual(wanted)).run(({ cold, expectObservable }: Run) => {
      const recents$ = recentSearches({
        storedRecents: () => cold(marbles.stored ?? 's', kept),
        storeRecents: marbles.storeRecents ?? storeNowhere
      })({
        chosen: cold(marbles.chosen ?? '', CHOSEN),
        cleared: cold(marbles.cleared ?? '', { c: undefined }),
        restored: cold(marbles.restored ?? '', { r: undefined })
      });
      expectObservable(recents$).toBe(expected, values);
    })
});

const recording = (): { readonly stored: RecentPlaces[]; readonly storeRecents: StoreRecents } => {
  const stored: RecentPlaces[] = [];
  return {
    stored,
    storeRecents: (recents): Observable<void> => {
      stored.push(recents);
      return of(undefined);
    }
  };
};

const counting = (): { readonly reads: string[]; readonly recents$: Observable<RecentPlaces> } => {
  const reads: string[] = [];
  const storedRecents = (): Observable<RecentPlaces> => {
    reads.push('read');
    return of([LOUVRE]);
  };
  return {
    reads,
    recents$: recentSearches({ storedRecents, storeRecents: storeNowhere })({
      chosen: new Subject(),
      cleared: new Subject(),
      restored: of()
    })
  };
};

describe('recent searches', () => {
  it('start with the places kept on the device', () => {
    expectRecents({ s: [LOUVRE] }, {}).toBe('s', { s: [LOUVRE] });
  });

  it('read the device once', () => {
    expectRecents({ s: [LOUVRE], t: [ORSAY] }, { stored: 's-t' }).toBe('s', { s: [LOUVRE] });
  });

  it('keep only the eight most recent places read from the device', () => {
    expectRecents({ s: NINE }, {}).toBe('s', { s: NINE.slice(0, 8) });
  });

  it('put the place chosen first', () => {
    expectRecents({ s: [LOUVRE] }, { chosen: '-o' }).toBe('so', { s: [LOUVRE], o: [ORSAY, LOUVRE] });
  });

  it('list a place chosen again once, first', () => {
    expectRecents({ s: [ORSAY, LOUVRE] }, { chosen: '-l' }).toBe('sl', { s: [ORSAY, LOUVRE], l: [LOUVRE, ORSAY] });
  });

  it('forget the oldest place when a ninth is chosen', () => {
    expectRecents({ s: NINE.slice(0, 8) }, { chosen: '-l' }).toBe('sl', {
      s: NINE.slice(0, 8),
      l: [LOUVRE, ...NINE.slice(0, 7)]
    });
  });

  it('keep only what a recent search needs of the place chosen', () => {
    expectRecents({ s: [] }, { chosen: '-f' }).toBe('sf', { s: [], f: [LOUVRE] });
  });

  it('keep the cuisine of a restaurant chosen', () => {
    expectRecents({ s: [] }, { chosen: '-t' }).toBe('st', { s: [], t: [TRATTORIA] });
  });

  it('forget every place when cleared', () => {
    expectRecents({ s: [LOUVRE] }, { cleared: '-c' }).toBe('sc', { s: [LOUVRE], c: [] });
  });

  it('keep working when the device cannot store them', () => {
    const storeRecents: StoreRecents = () => throwError(() => new Error('The storage is full.'));

    expectRecents({ s: [] }, { chosen: '-o', storeRecents }).toBe('so', { s: [], o: [ORSAY] });
  });
});

describe('recent searches on the device', () => {
  it('are stored each time they change', () => {
    const { stored, storeRecents } = recording();
    const chosen = new Subject<RecentPlace>();
    recentSearches({ storedRecents: () => of([LOUVRE]), storeRecents })({ chosen, cleared: of(), restored: of() }).subscribe();

    chosen.next(ORSAY);

    expect(stored).toEqual([[ORSAY, LOUVRE]]);
  });

  it('are stored empty once cleared', () => {
    const { stored, storeRecents } = recording();
    const cleared = new Subject<void>();
    recentSearches({ storedRecents: () => of([LOUVRE]), storeRecents })({ chosen: of(), cleared, restored: of() }).subscribe();

    cleared.next();

    expect(stored).toEqual([[]]);
  });

  it('are read once for every follower of the stream', () => {
    const { reads, recents$ } = counting();
    recents$.subscribe();

    recents$.subscribe();

    expect(reads).toHaveLength(1);
  });

  it('are read again once nobody follows them any more', () => {
    const { reads, recents$ } = counting();
    recents$.subscribe().unsubscribe();

    recents$.subscribe();

    expect(reads).toHaveLength(2);
  });

  it('give a late follower the latest list only', () => {
    const seen: RecentPlaces[] = [];
    const chosen = new Subject<RecentPlace>();
    const recents$ = recentSearches({ storedRecents: () => of([]), storeRecents: storeNowhere })({
      chosen,
      cleared: of(),
      restored: of()
    });
    recents$.subscribe();
    chosen.next(ORSAY);

    recents$.subscribe((recents) => {
      seen.push(recents);
    });

    expect(seen).toEqual([[ORSAY]]);
  });
});

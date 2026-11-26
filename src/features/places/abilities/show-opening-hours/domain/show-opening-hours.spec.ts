import { lastValueFrom, type Observable, of, throwError, toArray } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { readOpeningHours, type Where } from './opening-hours';
import { type HoursPlace, type HoursReader, type HoursView, showOpeningHours } from './show-opening-hours';

type Run = Parameters<Parameters<TestScheduler['run']>[0]>[0];

const MINUTE = 60_000;

const START = Date.parse('2026-11-24T10:00:00Z');

const WHERE: Where = { coordinates: { longitude: 2.35, latitude: 48.85 }, country: 'FR', timeZone: 'Europe/Paris' };

const SHOP: HoursPlace = { id: 'shop', kind: 'bakery', openingHours: 'Mo-Sa 07:00-20:00', where: WHERE };

const reader = (readable: boolean): HoursReader => ({
  readOpeningHours: (value, where, time) => (readable ? readOpeningHours(value, where, time) : undefined),
  statusAt: () => ({ state: 'open' }),
  weekAt: () => []
});

const KNOWN: HoursView = { status: 'known', week: [], now: { state: 'open' } };

const viewsOf = (
  place: HoursPlace | undefined,
  loaded: Observable<HoursReader> = of(reader(true)),
  time: Observable<number> = of(START)
): Promise<readonly HoursView[]> =>
  lastValueFrom(showOpeningHours({ loadHoursReader: () => loaded })({ opened: of(place), time }).pipe(toArray()));

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('showing the opening hours of the place opened', () => {
  it('shows none before a place opens', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      expectObservable(
        showOpeningHours({ loadHoursReader: () => of(reader(true)) })({ opened: cold('-'), time: cold('a', { a: START }) })
      ).toBe('n', { n: { status: 'none' } });
    });
  });

  it('shows none when no place is open', async () => {
    expect(await viewsOf(undefined)).toEqual([{ status: 'none' }]);
  });

  it('shows the week and the state of a place with opening hours', async () => {
    expect(await viewsOf(SHOP)).toEqual([{ status: 'none' }, KNOWN]);
  });

  it('says the opening hours cannot be read', async () => {
    expect(await viewsOf(SHOP, of(reader(false)))).toEqual([{ status: 'none' }, { status: 'unreadable' }]);
  });

  it('says the opening hours of a place that should have them are not known yet', async () => {
    expect(await viewsOf({ id: 'baker', kind: 'bakery', where: WHERE })).toEqual([{ status: 'none' }, { status: 'unknown' }]);
  });

  it('shows none for a place without opening hours that needs none', async () => {
    expect(await viewsOf({ id: 'square', kind: 'park', where: WHERE })).toEqual([{ status: 'none' }]);
  });

  it('shows none when the library cannot be loaded', async () => {
    expect(
      await viewsOf(
        SHOP,
        throwError(() => new Error('offline'))
      )
    ).toEqual([{ status: 'none' }]);
  });
});

describe('keeping the opening hours up to date', () => {
  it('updates them once a minute, not at every tick of the clock', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      const time = cold('a-b-c', { a: START, b: START + MINUTE / 2, c: START + MINUTE });
      expectObservable(
        showOpeningHours({ loadHoursReader: () => of(reader(true)) })({ opened: cold('p', { p: SHOP }), time })
      ).toBe('(nk)m', { n: { status: 'none' }, k: KNOWN, m: KNOWN });
    });
  });

  it('keeps them when the same place is told again', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      expectObservable(
        showOpeningHours({ loadHoursReader: () => of(reader(true)) })({
          opened: cold('p---q', { p: SHOP, q: { ...SHOP } }),
          time: cold('a', { a: START })
        })
      ).toBe('(nk)', { n: { status: 'none' }, k: KNOWN });
    });
  });

  it('follows another place opened', () => {
    scheduler().run(({ cold, expectObservable }: Run) => {
      expectObservable(
        showOpeningHours({ loadHoursReader: () => of(reader(true)) })({
          opened: cold('p---q', { p: SHOP, q: { id: 'baker', kind: 'bakery', where: WHERE } }),
          time: cold('a', { a: START })
        })
      ).toBe('(nk)u', { n: { status: 'none' }, k: KNOWN, u: { status: 'unknown' } });
    });
  });
});

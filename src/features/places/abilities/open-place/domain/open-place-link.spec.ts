import type { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Opening, openPlace, type PlaceSheet, placesOpenedAt, type SheetPlace } from './open-place';

const FLORE: SheetPlace = { id: 'flore', name: 'Café de Flore', coordinates: { longitude: 2.33, latitude: 48.85 } };

const POINT = { longitude: 2.3, latitude: 48.8 };

const OPENINGS: Readonly<Record<string, Opening>> = {
  f: { id: 'flore', from: 'link', at: POINT },
  u: { id: 'unknown', from: 'link', at: POINT },
  n: { id: 'unknown', from: 'link' }
};

const SHEETS: Readonly<Record<string, PlaceSheet>> = {
  c: { status: 'closed' },
  f: { status: 'open', place: FLORE, from: 'link' },
  m: { status: 'missing', at: POINT },
  n: { status: 'missing' }
};

const scheduler = (): TestScheduler => new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted));

const expectSheet = (places: string, opened: string, expected: string): void =>
  scheduler().run(({ cold, expectObservable }) => {
    const sheet$: Observable<PlaceSheet> = openPlace({ loadPlaces: () => cold(places, { p: [FLORE] }) })({
      opened: cold(opened, OPENINGS),
      closed: cold('')
    });
    expectObservable(sheet$).toBe(expected, SHEETS);
  });

describe('the sheet of a place a link names', () => {
  it('opens on the place', () => {
    expectSheet('p', '-f', 'cf');
  });

  it('tells the place is missing, at the point of the link', () => {
    expectSheet('p', '-u', 'cm');
  });

  it('tells the place is missing, without a point when the link has none', () => {
    expectSheet('p', '-n', 'cn');
  });

  it('tells the place is missing when the places cannot be loaded', () => {
    expectSheet('#', '-f', 'cm');
  });

  it('does not tell the map where a missing place stands', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(placesOpenedAt(cold('cm', SHEETS))).toBe('--');
    });
  });
});

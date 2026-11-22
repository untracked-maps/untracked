import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { Found } from '../../../domain/found';
import { addressesChosenAt, districtsChosenAt } from './chosen-place';

type Chosen = Pick<Found, 'kind' | 'coordinates'>;

const BAC = { longitude: 2.3262, latitude: 48.8585 };

const GERMAIN = { longitude: 2.333, latitude: 48.854 };

const CHOSEN: Readonly<Record<string, Chosen>> = {
  a: { kind: 'address', coordinates: BAC },
  s: { kind: 'street', coordinates: BAC },
  d: { kind: 'district', coordinates: GERMAIN },
  p: { kind: 'museum', coordinates: BAC }
};

const scheduler = (): TestScheduler => new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted));

describe('where an address chosen stands', () => {
  it('is told for an address', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(addressesChosenAt(cold('a', CHOSEN))).toBe('b', { b: BAC });
    });
  });

  it('is told for a street', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(addressesChosenAt(cold('s', CHOSEN))).toBe('b', { b: BAC });
    });
  });

  it('is left to the sheet of a place', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(addressesChosenAt(cold('p', CHOSEN))).toBe('-');
    });
  });

  it('is told apart for a district', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(addressesChosenAt(cold('d', CHOSEN))).toBe('-');
    });
  });
});

describe('where a district chosen stands', () => {
  it('is told for a district', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(districtsChosenAt(cold('d', CHOSEN))).toBe('g', { g: GERMAIN });
    });
  });

  it('is not told for an address', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(districtsChosenAt(cold('a', CHOSEN))).toBe('-');
    });
  });
});

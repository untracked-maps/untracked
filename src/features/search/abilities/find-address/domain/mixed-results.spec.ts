import { describe, expect, it } from 'vitest';
import type { Found } from '../../../domain/found';
import type { Place } from '../../../domain/place';
import type { RankedAddress } from './address-book';
import { mixedResults } from './mixed-results';

const HERE = { longitude: 2.35, latitude: 48.85 };

const address = (name: string, clean = true): RankedAddress => ({
  address: { id: name, name, kind: 'address', address: '75001 Paris', coordinates: HERE },
  clean
});

const place = (name: string): Place => ({ id: name, name, kind: 'cafe', address: '', coordinates: HERE, fame: 0 });

const ADDRESSES: readonly RankedAddress[] = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map((name) => address(name));

const UNSURE: readonly RankedAddress[] = ['A1', 'A2', 'A3'].map((name) => address(name, false));

const PLACES: readonly Place[] = ['P1', 'P2', 'P3', 'P4', 'P5'].map(place);

const names = (results: readonly Found[]): readonly string[] => results.map(({ name }) => name);

describe('results of an address query', () => {
  it('are the clean addresses alone, five at most', () => {
    expect(names(mixedResults('address', ADDRESSES, PLACES))).toEqual(['A1', 'A2', 'A3', 'A4', 'A5']);
  });

  it('mix one address, three places, then the rest, seven at most, when the first address is unsure', () => {
    expect(names(mixedResults('address', UNSURE, PLACES))).toEqual(['A1', 'P1', 'P2', 'P3', 'A2', 'A3', 'P4']);
  });

  it('end with the other places when few addresses are found', () => {
    expect(names(mixedResults('address', [address('A1', false)], PLACES))).toEqual(['A1', 'P1', 'P2', 'P3', 'P4', 'P5']);
  });

  it('are the places when no address is found', () => {
    expect(names(mixedResults('address', [], PLACES))).toEqual(['P1', 'P2', 'P3', 'P4', 'P5']);
  });
});

describe('results of a street query', () => {
  it('start with three clean streets at most, then the places, then the rest', () => {
    expect(names(mixedResults('street', ADDRESSES, PLACES.slice(0, 2)))).toEqual(['A1', 'A2', 'A3', 'P1', 'P2', 'A4', 'A5']);
  });

  it('put unsure streets after the places', () => {
    expect(names(mixedResults('street', [address('A1', false), address('A2')], PLACES.slice(0, 2)))).toEqual([
      'A2',
      'P1',
      'P2',
      'A1'
    ]);
  });

  it('are seven at most', () => {
    expect(mixedResults('street', ADDRESSES, PLACES)).toHaveLength(7);
  });
});

import { describe, expect, it } from 'vitest';
import type { Coordinates, Place, PlaceKind } from '../../../domain/place';
import { nearestOfKind } from './nearest-of-kind';

const HERE: Coordinates = { longitude: 2.35, latitude: 48.85 };

const KILOMETRES_PER_DEGREE_OF_LATITUDE = 110.54;

const placeNorth = (id: string, kilometres: number, kind: PlaceKind = 'bakery'): Place => ({
  id,
  name: id,
  kind,
  address: '',
  coordinates: { longitude: HERE.longitude, latitude: HERE.latitude + kilometres / KILOMETRES_PER_DEGREE_OF_LATITUDE },
  fame: 0
});

const idsOf = (places: readonly Place[]): readonly string[] => places.map(({ id }) => id);

const nearestBakeries = (places: readonly Place[]): readonly string[] => idsOf(nearestOfKind(places, 'bakery', HERE));

describe('nearest places of a kind', () => {
  it('are only those of the kind', () => {
    expect(nearestBakeries([placeNorth('pharmacy', 1, 'pharmacy'), placeNorth('bakery', 2)])).toEqual(['bakery']);
  });

  it('come nearest first', () => {
    expect(nearestBakeries([placeNorth('far', 2), placeNorth('near', 1)])).toEqual(['near', 'far']);
  });

  it('include a place three and a half kilometres away', () => {
    expect(
      idsOf(
        nearestOfKind([{ ...placeNorth('edge', 0), coordinates: { longitude: 0, latitude: 3500 / 110_540 } }], 'bakery', {
          longitude: 0,
          latitude: 0
        })
      )
    ).toEqual(['edge']);
  });

  it('leave out a place further away', () => {
    expect(nearestBakeries([placeNorth('beyond', 3.51)])).toEqual([]);
  });

  it('are at most twenty-five', () => {
    expect(nearestBakeries(Array.from({ length: 30 }, (_, index) => placeNorth(`bakery-${index}`, index / 10)))).toHaveLength(
      25
    );
  });

  it('keep the twenty-five nearest', () => {
    expect(
      nearestBakeries(Array.from({ length: 26 }, (_, index) => placeNorth(`bakery-${index}`, (26 - index) / 10))).at(-1)
    ).toBe('bakery-1');
  });
});

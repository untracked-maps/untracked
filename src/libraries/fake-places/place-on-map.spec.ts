import { describe, expect, it } from 'vitest';
import type { FakePlace } from './fake-place';
import { onMap } from './place-on-map';

const place = (kind: FakePlace['kind'], fame: number): FakePlace => ({
  id: 'a-place',
  name: 'A place',
  kind,
  address: '1 rue de la Paix, 75002 Paris',
  coordinates: { longitude: 2.33, latitude: 48.87 },
  fame
});

describe('the family of a fake place', () => {
  it.each([
    ['restaurant', 'food'],
    ['cafe', 'cafe'],
    ['bar', 'bar'],
    ['bakery', 'bakery'],
    ['supermarket', 'shop'],
    ['hairdresser', 'shop'],
    ['beauty-salon', 'shop'],
    ['florist', 'shop'],
    ['bookshop', 'shop'],
    ['department-store', 'shop'],
    ['museum', 'culture'],
    ['cinema', 'culture'],
    ['library', 'culture'],
    ['theatre', 'culture'],
    ['attraction', 'sight'],
    ['monument', 'sight'],
    ['place-of-worship', 'sight'],
    ['park', 'nature'],
    ['garden', 'nature'],
    ['pharmacy', 'health'],
    ['hospital', 'health'],
    ['hotel', 'stay'],
    ['station', 'train']
  ] as const)('of a %s is %s', (kind, family) => {
    expect(onMap(place(kind, 0)).family).toBe(family);
  });

  it.each(['parking', 'post-office', 'school'] as const)('is missing for a %s', (kind) => {
    expect(onMap(place(kind, 0))).not.toHaveProperty('family');
  });
});

describe('the zoom from which a fake place shows', () => {
  it('is 11.5 for the best known monument', () => {
    expect(onMap(place('attraction', 99)).minzoom).toBe(11.5);
  });

  it('is 13.75 at the earliest for a shop', () => {
    expect(onMap(place('department-store', 99)).minzoom).toBe(13.75);
  });

  it('is 13.75 at the earliest for a restaurant', () => {
    expect(onMap(place('restaurant', 99)).minzoom).toBe(13.75);
  });

  it('is 13.75 at the earliest for a place that is neither a monument nor a shop', () => {
    expect(onMap(place('hotel', 99)).minzoom).toBe(13.75);
  });

  it('is 16.5 for an unknown monument', () => {
    expect(onMap(place('museum', 0)).minzoom).toBe(16.5);
  });

  it('is 16.5 for an unknown shop', () => {
    expect(onMap(place('florist', 0)).minzoom).toBe(16.5);
  });

  it('comes earlier by steps of 0.25 as a monument is better known', () => {
    expect(onMap(place('museum', 30)).minzoom).toBe(15);
  });

  it('comes earlier by steps of 0.25 as a shop is better known', () => {
    expect(onMap(place('bakery', 30)).minzoom).toBe(15.75);
  });

  it.each(['museum', 'attraction', 'park', 'station'] as const)('may be before 13.75 for a %s', (kind) => {
    expect(onMap(place(kind, 99)).minzoom).toBe(11.5);
  });
});

describe('the rank of a fake place', () => {
  it('is the best for the best known monument', () => {
    expect(onMap(place('monument', 99)).rank).toBe(0);
  });

  it('gets worse as a monument is less known', () => {
    expect(onMap(place('monument', 90)).rank).toBe(9);
  });

  it('puts an unknown monument before the best known shop', () => {
    expect(onMap(place('museum', 0)).rank).toBeLessThan(onMap(place('department-store', 99)).rank);
  });

  it('gets worse as a shop is less known', () => {
    expect(onMap(place('bakery', 30)).rank).toBe(169);
  });
});

describe('a fake place on the map', () => {
  it('stays the place it was', () => {
    expect(onMap(place('cafe', 12))).toMatchObject(place('cafe', 12));
  });
});

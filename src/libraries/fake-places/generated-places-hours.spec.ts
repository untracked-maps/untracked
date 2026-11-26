import { base, fr } from '@faker-js/faker';
import OpeningHours from 'opening_hours';
import { describe, expect, it } from 'vitest';
import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';
import { PARIS } from './zones/paris/paris';

const LYON: FakeZone = {
  id: 'fake-lyon',
  city: 'Lyon',
  country: 'FR',
  timeZone: 'Europe/Paris',
  locale: [fr, base],
  postcodes: ['69001', '69002', '69003'],
  bounds: { west: 4.79, south: 45.71, east: 4.9, north: 45.8 },
  districts: [],
  landmarks: []
};

const PLACES = generatedPlaces(LYON, 800);

const IN_FRANCE = { lat: 45.76, lon: 4.84, address: { ['country_code' as const]: 'fr', state: '' } };

const hoursOf = ({ tags }: FakePlace): string | undefined => tags?.['opening_hours'];

const isReadable = (value: string): boolean => {
  try {
    return new OpeningHours(value, IN_FRANCE).getState(new Date(2026, 10, 24, 12)) !== undefined;
  } catch {
    return false;
  }
};

const ofKinds = (...kinds: readonly FakePlace['kind'][]): readonly FakePlace[] =>
  PLACES.filter(({ kind }) => kinds.includes(kind));

const shareWithHours = (places: readonly FakePlace[]): number =>
  places.filter((place) => hoursOf(place) !== undefined).length / places.length;

describe('the opening hours of generated places', () => {
  it('are given to most shops, cafés and restaurants', () => {
    expect(shareWithHours(ofKinds('restaurant', 'cafe', 'bakery', 'florist'))).toBeGreaterThan(0.6);
  });

  it('are not given to every one of them', () => {
    expect(shareWithHours(ofKinds('restaurant', 'cafe', 'bakery', 'florist'))).toBeLessThan(0.9);
  });

  it('are never given to schools, car parks, parks nor hospitals', () => {
    expect(ofKinds('school', 'parking', 'park', 'hospital').filter((place) => hoursOf(place) !== undefined)).toEqual([]);
  });

  it('are values that OpenStreetMap can read, but a few', () => {
    expect(
      PLACES.map(hoursOf)
        .filter((value): value is string => value !== undefined)
        .filter((value) => !isReadable(value)).length
    ).toBeLessThan(3);
  });
});

describe('the opening hours of the fake places of Paris', () => {
  it('are badly written for three of them', () => {
    expect(
      generatedPlaces(PARIS, 2000)
        .map(hoursOf)
        .filter((value): value is string => value !== undefined)
        .filter((value) => !isReadable(value))
    ).toHaveLength(3);
  });

  it('are written by hand for the famous places', () => {
    expect(PARIS.landmarks.filter((place) => hoursOf(place) !== undefined)).toHaveLength(25);
  });

  it('are written readably for the famous places', () => {
    expect(
      PARIS.landmarks
        .map(hoursOf)
        .filter((value): value is string => value !== undefined)
        .filter((value) => !isReadable(value))
    ).toEqual([]);
  });
});

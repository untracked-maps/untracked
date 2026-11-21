import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';

const SAINT_MALO: FakeZone = {
  id: 'fake-saint-malo',
  city: 'Saint-Malo',
  country: 'FR',
  locale: [fr, base],
  bounds: { west: -2.04, south: 48.62, east: -1.95, north: 48.66 },
  postcodes: ['35400'],
  landmarks: [],
  districts: []
};

const PLACES = generatedPlaces(SAINT_MALO, 500);

const NUMBER = /^\d{1,3}$/u;

const RESTAURANTS = PLACES.filter(({ kind }) => kind === 'restaurant');

describe('generated places', () => {
  it('are as many as asked', () => {
    expect(PLACES).toHaveLength(500);
  });

  it('are the same at every build', () => {
    expect(generatedPlaces(SAINT_MALO, 1)).toEqual(generatedPlaces(SAINT_MALO, 1));
  });

  it('are numbered from one after their zone', () => {
    expect(PLACES.at(-1)?.id).toBe('fake-saint-malo-0500');
  });

  it('lie within their zone, east to west', () => {
    expect(PLACES.every(({ coordinates: { longitude } }) => longitude >= -2.04 && longitude <= -1.95)).toBe(true);
  });

  it('lie within their zone, north to south', () => {
    expect(PLACES.every(({ coordinates: { latitude } }) => latitude >= 48.62 && latitude <= 48.66)).toBe(true);
  });
});

describe('the addresses of generated places', () => {
  it('are at a postcode of their zone', () => {
    expect(PLACES.filter(({ address }) => address.postalCode !== '35400')).toEqual([]);
  });

  it('are in the city of their zone', () => {
    expect(PLACES.filter(({ address }) => address.addressLocality !== 'Saint-Malo')).toEqual([]);
  });

  it('are in the country of their zone', () => {
    expect(PLACES.filter(({ address }) => address.addressCountry !== 'FR')).toEqual([]);
  });

  it('have a house number', () => {
    expect(PLACES.filter(({ address }) => !NUMBER.test(address.houseNumber ?? ''))).toEqual([]);
  });

  it('have a street', () => {
    expect(PLACES.filter(({ address }) => (address.street ?? '') === '')).toEqual([]);
  });
});

describe('the cuisines of generated places', () => {
  it('are given to most restaurants', () => {
    expect(RESTAURANTS.filter(({ cuisine }) => cuisine !== undefined).length).toBeGreaterThan(RESTAURANTS.length * 0.7);
  });

  it('leave some restaurants without one', () => {
    expect(RESTAURANTS.some(({ cuisine }) => cuisine === undefined)).toBe(true);
  });

  it('are given to restaurants only', () => {
    expect(PLACES.filter(({ kind, cuisine }) => kind !== 'restaurant' && cuisine !== undefined)).toEqual([]);
  });

  it('are of several kinds', () => {
    expect(new Set(RESTAURANTS.map(({ cuisine }) => cuisine)).size).toBeGreaterThan(5);
  });
});

describe('the fame of generated places', () => {
  it('is mostly none', () => {
    expect(PLACES.filter(({ fame }) => fame === 0).length).toBeGreaterThan(450);
  });

  it('is at most a little', () => {
    expect(Math.max(...PLACES.map(({ fame }) => fame))).toBeLessThanOrEqual(30);
  });

  it('is sometimes a little', () => {
    expect(PLACES.some(({ fame }) => fame > 0)).toBe(true);
  });
});

describe('the kinds of generated places', () => {
  it('are many', () => {
    expect(new Set(PLACES.map(({ kind }) => kind)).size).toBe(20);
  });
});

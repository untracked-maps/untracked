import { base, fr } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';

const SAINT_MALO: FakeZone = {
  id: 'fake-saint-malo',
  city: 'Saint-Malo',
  locale: [fr, base],
  bounds: { west: -2.04, south: 48.62, east: -1.95, north: 48.66 },
  postcodes: ['35400'],
  landmarks: [],
  districts: []
};

const PLACES = generatedPlaces(SAINT_MALO, 500);

const ADDRESS = /^\d{1,3} .+, 35400 Saint-Malo$/u;

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

  it('have a one-line address at a postcode of their zone, in its city', () => {
    expect(PLACES.filter(({ address }) => !ADDRESS.test(address))).toEqual([]);
  });

  it('are mostly unknown', () => {
    expect(PLACES.filter(({ fame }) => fame === 0).length).toBeGreaterThan(450);
  });

  it('are at most a little known', () => {
    expect(Math.max(...PLACES.map(({ fame }) => fame))).toBeLessThanOrEqual(30);
  });

  it('are sometimes a little known', () => {
    expect(PLACES.some(({ fame }) => fame > 0)).toBe(true);
  });

  it('are of many kinds', () => {
    expect(new Set(PLACES.map(({ kind }) => kind)).size).toBe(20);
  });
});

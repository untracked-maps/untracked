import { describe, expect, it } from 'vitest';
import { generatedPlaces } from './generated-places';

const PLACES = generatedPlaces(500);

const ADDRESS = /^\d{1,3} .+, 750(?:0[1-9]|1\d|20) Paris$/u;

describe('generated places', () => {
  it('are as many as asked', () => {
    expect(PLACES).toHaveLength(500);
  });

  it('are the same at every build', () => {
    expect(generatedPlaces(1)).toEqual([
      {
        id: 'fake-paris-0001',
        name: 'Pharmacie Vincent',
        kind: 'pharmacy',
        address: '44 Passage Delesseux, 75015 Paris',
        coordinates: { longitude: 2.325_07, latitude: 48.850_07 },
        fame: 0
      }
    ]);
  });

  it('are numbered from one', () => {
    expect(PLACES.at(-1)?.id).toBe('fake-paris-0500');
  });

  it('lie within Paris, east to west', () => {
    expect(PLACES.every(({ coordinates: { longitude } }) => longitude >= 2.22 && longitude <= 2.47)).toBe(true);
  });

  it('lie within Paris, north to south', () => {
    expect(PLACES.every(({ coordinates: { latitude } }) => latitude >= 48.81 && latitude <= 48.91)).toBe(true);
  });

  it('have a one-line address in a Paris arrondissement', () => {
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

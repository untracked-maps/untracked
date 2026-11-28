import { describe, expect, it } from 'vitest';
import { type Area, coveredOnly, isCovered } from './coverage';

const CITY: Area = { west: 2.22, south: 48.81, east: 2.47, north: 48.91 };

const OTHER_CITY: Area = { west: 4.73, south: 52.27, east: 5.07, north: 52.43 };

describe('a place covered by the detailed data', () => {
  it.each([
    ['inside the city', 48.85, 2.33],
    ['on its western edge', 48.85, 2.22],
    ['on its eastern edge', 48.85, 2.47],
    ['on its southern edge', 48.81, 2.33],
    ['on its northern edge', 48.91, 2.33]
  ])('is a place %s', (_where, latitude, longitude) => {
    expect(isCovered([CITY])({ longitude, latitude })).toBe(true);
  });

  it('is a place inside the second city covered', () => {
    expect(isCovered([OTHER_CITY, CITY])({ longitude: 2.33, latitude: 48.85 })).toBe(true);
  });
});

describe('a place out of the covered area', () => {
  it.each([
    ['west of the city', 48.85, 2.21],
    ['east of the city', 48.85, 2.48],
    ['south of the city', 48.8, 2.33],
    ['north of the city', 48.92, 2.33]
  ])('is a place %s', (_where, latitude, longitude) => {
    expect(isCovered([CITY])({ longitude, latitude })).toBe(false);
  });

  it('is any place when no city is covered', () => {
    expect(isCovered([])({ longitude: 2.33, latitude: 48.85 })).toBe(false);
  });
});

describe('the places covered', () => {
  it('keep only the places inside a city covered, in their order', () => {
    expect(
      coveredOnly([CITY])([
        { id: 'flore', coordinates: { longitude: 2.33, latitude: 48.85 } },
        { id: 'versailles', coordinates: { longitude: 2.12, latitude: 48.8 } },
        { id: 'luigi', coordinates: { longitude: 2.34, latitude: 48.86 } }
      ]).map(({ id }) => id)
    ).toEqual(['flore', 'luigi']);
  });
});

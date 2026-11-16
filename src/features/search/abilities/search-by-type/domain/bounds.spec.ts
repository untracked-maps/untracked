import { describe, expect, it } from 'vitest';
import { boundsOf } from './bounds';

describe('bounds of places', () => {
  it('are the point itself for a single place', () => {
    expect(boundsOf([{ coordinates: { longitude: 2.3, latitude: 48.8 } }])).toEqual({
      west: 2.3,
      south: 48.8,
      east: 2.3,
      north: 48.8
    });
  });

  it('reach the furthest place on every side', () => {
    expect(
      boundsOf([
        { coordinates: { longitude: 2.3, latitude: 48.8 } },
        { coordinates: { longitude: 2.4, latitude: 48.7 } },
        { coordinates: { longitude: 2.2, latitude: 48.9 } }
      ])
    ).toEqual({ west: 2.2, south: 48.7, east: 2.4, north: 48.9 });
  });

  it('keep the first place when the others are inside', () => {
    expect(
      boundsOf([
        { coordinates: { longitude: 2.2, latitude: 48.7 } },
        { coordinates: { longitude: 2.4, latitude: 48.9 } },
        { coordinates: { longitude: 2.3, latitude: 48.8 } }
      ])
    ).toEqual({ west: 2.2, south: 48.7, east: 2.4, north: 48.9 });
  });
});

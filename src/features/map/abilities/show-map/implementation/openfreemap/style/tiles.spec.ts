import { describe, expect, it } from 'vitest';
import { fromTiles, openMapTilesSource } from './tiles';

const OPENSTREETMAP_CREDIT = /OpenStreetMap contributors/u;

describe('tiles', () => {
  it('reads a layer from the OpenMapTiles source', () => {
    expect(fromTiles('water')).toStrictEqual({ source: 'openmaptiles', 'source-layer': 'water' });
  });

  it('serves the OpenFreeMap planet', () => {
    expect(openMapTilesSource.url).toBe('https://tiles.openfreemap.org/planet');
  });

  it('credits the OpenStreetMap contributors', () => {
    expect(openMapTilesSource.attribution).toMatch(OPENSTREETMAP_CREDIT);
  });
});

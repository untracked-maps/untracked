import { describe, expect, it } from 'vitest';
import { fromTiles, openMapTilesSource } from './tiles';

const OPENSTREETMAP_CREDIT = /OpenStreetMap contributors/u;

describe('tiles', () => {
  it('reads a layer from the OpenMapTiles source', () => {
    expect(fromTiles('water')).toStrictEqual({ source: 'openmaptiles', 'source-layer': 'water' });
  });

  it('describes the OpenFreeMap planet through the protocol that falls back on its backup', () => {
    expect(openMapTilesSource.url).toBe('openfreemap://planet');
  });

  it('credits the OpenStreetMap contributors', () => {
    expect(openMapTilesSource.attribution).toMatch(OPENSTREETMAP_CREDIT);
  });
});

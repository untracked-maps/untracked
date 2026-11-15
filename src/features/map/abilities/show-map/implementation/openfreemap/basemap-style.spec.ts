import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import { basemapStyle } from './basemap-style';

const GLYPHS = 'https://untracked.test/fonts/{fontstack}/{range}.pbf';

const OPENFREEMAP_LINK = /<a href=[^>]*https:\/\/openfreemap\.org[^>]*>OpenFreeMap<\/a>/u;

describe('basemap style', () => {
  it('is a valid MapLibre style', () => {
    expect(validateStyleMin(basemapStyle(GLYPHS))).toStrictEqual([]);
  });

  it('loads its glyphs from the given URL template', () => {
    expect(basemapStyle(GLYPHS).glyphs).toBe(GLYPHS);
  });

  it('draws from the OpenFreeMap planet tiles', () => {
    expect(basemapStyle(GLYPHS).sources).toHaveProperty(['openmaptiles', 'url'], 'https://tiles.openfreemap.org/planet');
  });

  it('links to OpenFreeMap in its attribution', () => {
    expect(JSON.stringify(basemapStyle(GLYPHS).sources)).toMatch(OPENFREEMAP_LINK);
  });

  it('has no source other than OpenMapTiles', () => {
    expect(Object.keys(basemapStyle(GLYPHS).sources)).toStrictEqual(['openmaptiles']);
  });

  it('stacks the basemap layers from the land up to the house numbers', () => {
    expect(basemapStyle(GLYPHS).layers.map(({ id }) => id)).toStrictEqual([
      'land',
      'landuse-alt',
      'landuse-green',
      'landcover',
      'park',
      'water',
      'waterway',
      'pedestrian-area',
      'building',
      'building-edge',
      'pedestrian-street',
      'path',
      'road-minor-case',
      'road-minor',
      'road-mid-case',
      'road-mid',
      'road-major-case',
      'road-major',
      'road-highway-case',
      'road-highway',
      'rail',
      'boundary-region',
      'boundary-country',
      'boundary-city',
      'road-name-major',
      'road-name',
      'place-small',
      'place-town',
      'place-city',
      'housenumber'
    ]);
  });
});

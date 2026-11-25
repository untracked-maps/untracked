import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import { type BasemapImagery, basemapStyle } from './basemap-style';
import { basemapPalettes } from './style/colours';

const GLYPHS = 'https://untracked.test/fonts/{fontstack}/{range}.pbf';

const SPRITE = 'https://untracked.test/sprites/basemap';

const ASSETS = { glyphs: GLYPHS, sprite: SPRITE };

const LIGHT = basemapPalettes.light;

const DARK = basemapPalettes.dark;

const IMAGERY: BasemapImagery = {
  sources: { photos: { type: 'raster', tiles: ['https://photos.test/{z}/{x}/{y}.jpg'] } },
  layers: [{ id: 'photos', type: 'raster', source: 'photos' }]
};

const OPENFREEMAP_LINK = /<a href=[^>]*https:\/\/openfreemap\.org[^>]*>OpenFreeMap<\/a>/u;

describe('basemap style', () => {
  it('is a valid MapLibre style', () => {
    expect(validateStyleMin(basemapStyle(ASSETS, LIGHT))).toStrictEqual([]);
  });

  it('is a valid MapLibre style in the dark palette', () => {
    expect(validateStyleMin(basemapStyle(ASSETS, DARK))).toStrictEqual([]);
  });

  it('paints the land in the given palette', () => {
    expect(basemapStyle(ASSETS, DARK).layers[0]).toHaveProperty(['paint', 'background-color', 6], DARK.land);
  });

  it('draws the same layers in every palette', () => {
    expect(basemapStyle(ASSETS, DARK).layers.map(({ id }) => id)).toStrictEqual(
      basemapStyle(ASSETS, LIGHT).layers.map(({ id }) => id)
    );
  });

  it('loads its glyphs from the given URL template', () => {
    expect(basemapStyle(ASSETS, LIGHT).glyphs).toBe(GLYPHS);
  });

  it('loads its icons from the given sprite URL', () => {
    expect(basemapStyle(ASSETS, LIGHT).sprite).toBe(SPRITE);
  });

  it('draws from the OpenFreeMap planet tiles', () => {
    expect(basemapStyle(ASSETS, LIGHT).sources).toHaveProperty(['openmaptiles', 'url'], 'https://tiles.openfreemap.org/planet');
  });

  it('links to OpenFreeMap in its attribution', () => {
    expect(JSON.stringify(basemapStyle(ASSETS, LIGHT).sources)).toMatch(OPENFREEMAP_LINK);
  });

  it('has no source other than OpenMapTiles', () => {
    expect(Object.keys(basemapStyle(ASSETS, LIGHT).sources)).toStrictEqual(['openmaptiles']);
  });

  it('stacks the basemap layers from the land up to the house numbers', () => {
    expect(basemapStyle(ASSETS, LIGHT).layers.map(({ id }) => id)).toStrictEqual([
      'land',
      'landuse-alt',
      'landuse-green',
      'landcover',
      'landcover-wood',
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
      'station',
      'place-small',
      'place-town',
      'place-city',
      'housenumber'
    ]);
  });
});

describe('basemap style with imagery', () => {
  it('draws the imagery it is given from its own source', () => {
    expect(basemapStyle(ASSETS, LIGHT, IMAGERY).sources).toHaveProperty(['photos', 'type'], 'raster');
  });

  it('draws the imagery it is given over the shapes and under the labels', () => {
    expect(
      basemapStyle(ASSETS, LIGHT, IMAGERY)
        .layers.map(({ id }) => id)
        .slice(24, 27)
    ).toStrictEqual(['boundary-city', 'photos', 'road-name-major']);
  });

  it('is a valid MapLibre style with imagery', () => {
    expect(validateStyleMin(basemapStyle(ASSETS, LIGHT, IMAGERY))).toStrictEqual([]);
  });
});

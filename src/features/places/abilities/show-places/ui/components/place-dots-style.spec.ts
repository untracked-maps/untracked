import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import type { PlaceDot } from '../../domain/show-places';
import { PLACE_DOTS_SOURCE, placeDotsData, placeDotsLayers } from './place-dots-style';

const CAMILLE: PlaceDot = {
  name: 'Chez Camille',
  family: 'food',
  coordinates: { longitude: 2.35, latitude: 48.86 },
  order: 0
};

const PARKING: PlaceDot = { ...CAMILLE, name: 'Parking Vinci', family: undefined, order: 5 };

const styleOf = (palette: 'light' | 'dark'): Parameters<typeof validateStyleMin>[0] => ({
  version: 8,
  glyphs: 'https://example.org/{fontstack}/{range}.pbf',
  sources: { [PLACE_DOTS_SOURCE]: { type: 'geojson', data: placeDotsData([CAMILLE, PARKING]) } },
  layers: [...placeDotsLayers(palette)]
});

const [WITHOUT_FAMILY, WITH_FAMILY] = placeDotsLayers('light');

const [WITHOUT_FAMILY_IN_THE_DARK, WITH_FAMILY_IN_THE_DARK] = placeDotsLayers('dark');

describe('place dots on the map', () => {
  it.each(['light', 'dark'] as const)('make a valid MapLibre style in the %s palette', (palette) => {
    expect(validateStyleMin(styleOf(palette))).toStrictEqual([]);
  });

  it('are points named after their place, with its family and its order', () => {
    expect(placeDotsData([CAMILLE])).toStrictEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2.35, 48.86] },
          properties: { name: 'Chez Camille', family: 'food', order: 0 }
        }
      ]
    });
  });

  it('say when a place has no family', () => {
    expect(placeDotsData([PARKING]).features[0]?.properties).toStrictEqual({ name: 'Parking Vinci', family: 'none', order: 5 });
  });

  it('are drawn in two layers of symbols, the places without a family underneath', () => {
    expect(placeDotsLayers('light').map(({ id, type, source }) => ({ id, type, source }))).toStrictEqual([
      { id: 'place-dots-without-family', type: 'symbol', source: 'place-dots' },
      { id: 'place-dots', type: 'symbol', source: 'place-dots' }
    ]);
  });
});

describe('the dot of a place with a family', () => {
  it('is drawn for the places that have a family', () => {
    expect(WITH_FAMILY).toHaveProperty('filter', ['!=', ['get', 'family'], 'none']);
  });

  it('is the icon of its family in the sprite', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'icon-image'], ['concat', 'place-', ['get', 'family']]);
  });

  it('grows from 0.8 of its size at zoom 11.5 to 0.9 at zoom 14 and its full size from zoom 16.5', () => {
    expect(WITH_FAMILY).toHaveProperty(
      ['layout', 'icon-size'],
      ['interpolate', ['exponential', 1.5], ['zoom'], 11.5, 0.8, 14, 0.9, 16.5, 1]
    );
  });

  it('gives way to the dot of a place that goes before it', () => {
    expect(WITH_FAMILY).toHaveProperty(['layout', 'symbol-sort-key'], ['get', 'order']);
  });
});

describe('the dot of a place without a family', () => {
  it('is drawn for the places that have no family', () => {
    expect(WITHOUT_FAMILY).toHaveProperty('filter', ['==', ['get', 'family'], 'none']);
  });

  it('is the grey icon of the sprite', () => {
    expect(WITHOUT_FAMILY).toHaveProperty(['layout', 'icon-image'], 'place-none');
  });

  it('is 0.85 of the size of a dot', () => {
    expect(WITHOUT_FAMILY).toHaveProperty(['layout', 'icon-size'], 0.85);
  });

  it('has a name of 11.5 pixels', () => {
    expect(WITHOUT_FAMILY).toHaveProperty(['layout', 'text-size'], 11.5);
  });

  it('has a name that starts 1.05 em from its centre', () => {
    expect(WITHOUT_FAMILY).toHaveProperty(['layout', 'text-offset'], [1.05, 0]);
  });

  it('has a name whose lines are 1.15 em high', () => {
    expect(WITHOUT_FAMILY).toHaveProperty(['layout', 'text-line-height'], 1.15);
  });

  it('has a name written as the names of the other places', () => {
    expect(WITHOUT_FAMILY?.layout).toMatchObject({
      'text-field': ['get', 'name'],
      'text-font': ['Inter SemiBold'],
      'text-anchor': 'left',
      'text-max-width': 8,
      'symbol-sort-key': ['get', 'order']
    });
  });

  it('has a name coloured and haloed as the names of the other places', () => {
    expect(WITHOUT_FAMILY?.paint).toStrictEqual(WITH_FAMILY?.paint);
  });

  it('has a name coloured and haloed as the names of the other places in the dark palette', () => {
    expect(WITHOUT_FAMILY_IN_THE_DARK?.paint).toStrictEqual(WITH_FAMILY_IN_THE_DARK?.paint);
  });
});

import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import { loadBikeLanesLayers } from './bike-lanes-overlay';
import { bikeLanesLayers } from './bike-lanes-style';

const styleOf = (palette: 'light' | 'dark'): Parameters<typeof validateStyleMin>[0] => {
  const { sources, layers } = bikeLanesLayers(palette);
  return { version: 8, sources: { ...sources }, layers: [...layers] };
};

describe('bike lanes layers', () => {
  it('make a valid MapLibre style', () => {
    expect(validateStyleMin(styleOf('light'))).toStrictEqual([]);
  });

  it('make a valid MapLibre style in the dark palette', () => {
    expect(validateStyleMin(styleOf('dark'))).toStrictEqual([]);
  });

  it('come from the bike lanes the Géoplateforme serves', () => {
    expect(bikeLanesLayers('light').sources).toHaveProperty(
      ['ign-bike-lanes', 'tiles'],
      ['https://data.geopf.fr/tms/1.0.0/OSM.PISTECYCLABLE/{z}/{x}/{y}.pbf']
    );
  });

  it('draw each of the four kinds of bike lane in its own layer', () => {
    expect(bikeLanesLayers('light').layers.map(({ filter }) => filter)).toStrictEqual([
      ['==', ['get', 'symbol'], 'voie_partage'],
      ['==', ['get', 'symbol'], 'trottoir_cyclable'],
      ['==', ['get', 'symbol'], 'bande_cyclable'],
      ['==', ['get', 'symbol'], 'piste_cyclable']
    ]);
  });

  it('ask for tiles over metropolitan France only', () => {
    expect(bikeLanesLayers('light').sources).toHaveProperty(['ign-bike-lanes', 'bounds'], [-4.93, 41.43, 9.85, 51.28]);
  });

  it('name each layer after its kind of bike lane', () => {
    expect(bikeLanesLayers('light').layers.map(({ id }) => id)).toStrictEqual([
      'ign-bike-lanes-voie_partage',
      'ign-bike-lanes-trottoir_cyclable',
      'ign-bike-lanes-bande_cyclable',
      'ign-bike-lanes-piste_cyclable'
    ]);
  });
});

describe('bike lanes layers, by kind', () => {
  it('dash the lanes shared with other traffic', () => {
    expect(bikeLanesLayers('light').layers[0]).toHaveProperty(['paint', 'line-dasharray'], [2, 1.5]);
  });

  it('draw the separate bike tracks as a solid line', () => {
    expect(bikeLanesLayers('light').layers[3]?.paint).not.toHaveProperty('line-dasharray');
  });

  it('round the ends of solid lines', () => {
    expect(bikeLanesLayers('light').layers[3]).toHaveProperty(['layout', 'line-cap'], 'round');
  });

  it('keep the ends of dashes square', () => {
    expect(bikeLanesLayers('light').layers[0]).toHaveProperty(['layout', 'line-cap'], 'butt');
  });

  it('draw in lighter colours on the dark palette', () => {
    expect(bikeLanesLayers('dark').layers[3]).toHaveProperty(['paint', 'line-color'], '#5ad17f');
  });

  it('are loaded when the bike lanes are first shown', async () => {
    expect(await loadBikeLanesLayers('dark')).toStrictEqual(bikeLanesLayers('dark'));
  });
});

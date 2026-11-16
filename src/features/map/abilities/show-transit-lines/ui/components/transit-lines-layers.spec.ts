import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import type { TransitLine } from '../../domain/show-transit-lines';
import { transitLinesLayers } from './transit-lines-layers';
import { loadTransitLinesLayers } from './transit-lines-overlay';

const PATH = [
  [2.2389, 48.8918],
  [2.4485, 48.8445]
] as const;

const METRO_1: TransitLine = { mode: 'metro', colour: '#ffcd00', path: PATH };

const TER: TransitLine = { mode: 'train', colour: undefined, path: PATH };

const sourcesOf = (lines: readonly TransitLine[]): unknown => transitLinesLayers(lines).sources;

describe('transit lines layers', () => {
  it('draw each line along its path', () => {
    expect(sourcesOf([METRO_1])).toHaveProperty(['idfm-transit-lines', 'data', 'features', 0, 'geometry'], {
      type: 'LineString',
      coordinates: [
        [2.2389, 48.8918],
        [2.4485, 48.8445]
      ]
    });
  });

  it('tell the mode and the official colour of each line', () => {
    expect(sourcesOf([METRO_1])).toHaveProperty(['idfm-transit-lines', 'data', 'features', 0, 'properties'], {
      mode: 'metro',
      colour: '#ffcd00'
    });
  });

  it('leave the colour of a line without an official colour to the style', () => {
    expect(sourcesOf([TER])).not.toHaveProperty(['idfm-transit-lines', 'data', 'features', 0, 'properties', 'colour']);
  });

  it('tell the mode of a line without an official colour', () => {
    expect(sourcesOf([TER])).toHaveProperty(['idfm-transit-lines', 'data', 'features', 0, 'properties', 'mode'], 'train');
  });

  it('make a GeoJSON feature collection', () => {
    expect(sourcesOf([METRO_1])).toHaveProperty(['idfm-transit-lines', 'data', 'type'], 'FeatureCollection');
  });

  it('make a GeoJSON feature of each line', () => {
    expect(sourcesOf([METRO_1])).toHaveProperty(['idfm-transit-lines', 'data', 'features', 0, 'type'], 'Feature');
  });

  it('make a valid MapLibre style', () => {
    const { sources, layers } = transitLinesLayers([METRO_1, TER]);

    expect(validateStyleMin({ version: 8, sources: { ...sources }, layers: [...layers] })).toStrictEqual([]);
  });

  it('are loaded when the lines are first shown', async () => {
    expect(await loadTransitLinesLayers([METRO_1])).toStrictEqual(transitLinesLayers([METRO_1]));
  });
});

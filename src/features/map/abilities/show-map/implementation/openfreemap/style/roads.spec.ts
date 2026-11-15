import type { StylePropertySpecification } from '@maplibre/maplibre-gl-style-spec';
import { normalizePropertyExpression } from '@maplibre/maplibre-gl-style-spec';
import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { roadLayers } from './roads';

const LIGHT = basemapPalettes.light;

const LINE_WIDTH: StylePropertySpecification = {
  type: 'number',
  'property-type': 'data-driven',
  expression: { interpolated: true, parameters: ['zoom', 'feature'] },
  transition: true
};

const roadLayer = (id: string): ReturnType<typeof roadLayers>[number] | undefined =>
  roadLayers(LIGHT).find((layer) => layer.id === id);

const widthAt = (id: string, zoom: number): unknown =>
  normalizePropertyExpression(roadLayer(id)?.paint?.['line-width'] ?? 0, 'line-width', LINE_WIDTH).evaluate({ zoom });

describe('road layers', () => {
  it('draws each road class over its casing, from the smallest to motorways', () => {
    expect(roadLayers(LIGHT).map(({ id }) => id)).toStrictEqual([
      'road-minor-case',
      'road-minor',
      'road-mid-case',
      'road-mid',
      'road-major-case',
      'road-major',
      'road-highway-case',
      'road-highway'
    ]);
  });

  it('widens minor roads to 6 pixels at zoom 16', () => {
    expect(widthAt('road-minor', 16)).toBe(6);
  });

  it('widens motorways to 38 pixels at zoom 19', () => {
    expect(widthAt('road-highway', 19)).toBe(38);
  });

  it('makes a casing 0.9 pixel wider than its road', () => {
    expect(widthAt('road-major-case', 14)).toBeCloseTo(5.5);
  });

  it('fades in the casing of minor roads from zoom 14 to 15', () => {
    expect(roadLayer('road-minor-case')).toHaveProperty(
      ['paint', 'line-opacity'],
      ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1]
    );
  });

  it('keeps the casing of middle roads opaque', () => {
    expect(roadLayer('road-mid-case')).not.toHaveProperty(['paint', 'line-opacity']);
  });

  it('shows middle roads from zoom 9', () => {
    expect(roadLayer('road-mid')).toHaveProperty('minzoom', 9);
  });

  it('paints motorways amber', () => {
    expect(roadLayer('road-highway')).toHaveProperty(['paint', 'line-color'], LIGHT.highway);
  });

  it('rounds road ends', () => {
    expect(roadLayer('road-minor')).toHaveProperty(['layout', 'line-cap'], 'round');
  });
});

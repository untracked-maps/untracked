import { describe, expect, it } from 'vitest';
import { boundaryLayers } from './boundaries';

describe('boundary layers', () => {
  it('draws regions, countries then cities', () => {
    expect(boundaryLayers.map(({ id }) => id)).toStrictEqual(['boundary-region', 'boundary-country', 'boundary-city']);
  });

  it('hides region boundaries beyond zoom 11', () => {
    expect(boundaryLayers[0]).toHaveProperty('maxzoom', 11);
  });

  it('dashes city boundaries', () => {
    expect(boundaryLayers[2]).toHaveProperty(['paint', 'line-dasharray'], [3, 2]);
  });

  it('leaves out maritime country boundaries', () => {
    expect(boundaryLayers[1]).toHaveProperty(['filter', 2], ['!=', ['get', 'maritime'], 1]);
  });
});

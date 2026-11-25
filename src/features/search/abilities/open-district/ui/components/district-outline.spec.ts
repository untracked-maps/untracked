import { describe, expect, it } from 'vitest';
import { districtOutlineLayers } from './district-outline';

const RING = [
  { longitude: 2.35, latitude: 48.85 },
  { longitude: 2.37, latitude: 48.85 },
  { longitude: 2.36, latitude: 48.87 },
  { longitude: 2.35, latitude: 48.85 }
];

const layers = await districtOutlineLayers(RING);

const [line] = layers.layers;

describe('the outline of a district on the map', () => {
  it('is a GeoJSON polygon of the outline', () => {
    expect(layers.sources['open-district-outline']).toEqual({
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [2.35, 48.85],
              [2.37, 48.85],
              [2.36, 48.87],
              [2.35, 48.85]
            ]
          ]
        }
      }
    });
  });

  it('is drawn as a line of that source', () => {
    expect(line).toMatchObject({ id: 'open-district-outline', type: 'line', source: 'open-district-outline' });
  });

  it('is drawn in the red of the pin', () => {
    expect(line?.paint).toMatchObject({ 'line-color': '#D93A2F' });
  });

  it('is 2 px wide', () => {
    expect(line?.paint).toMatchObject({ 'line-width': 2 });
  });

  it('is dashed by 2 px with gaps of 3 px, counted in widths of the line', () => {
    expect(line?.paint).toMatchObject({ 'line-dasharray': [1, 1.5] });
  });

  it('is slightly transparent', () => {
    expect(line?.paint).toMatchObject({ 'line-opacity': 0.8 });
  });

  it('has round joins', () => {
    expect(line?.layout).toEqual({ 'line-join': 'round' });
  });
});

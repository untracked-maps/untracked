import { describe, expect, it } from 'vitest';
import { exitsData, stationExitsLayers } from './station-exits-style';

const AT = { longitude: 2.355, latitude: 48.88 };

describe('the exits drawn on the map', () => {
  it('are numbered, an exit without number with nothing', () => {
    expect(
      exitsData({
        status: 'open',
        id: 'nord',
        exits: [{ ref: '1', coordinates: AT }, { coordinates: AT }],
        departures: { status: 'asked' }
      }).features.map(
        (feature: { readonly properties?: Readonly<Record<string, unknown>> | null }) => feature.properties?.['ref']
      )
    ).toEqual(['1', '']);
  });

  it('are points of GeoJSON', () => {
    expect(
      exitsData({ status: 'open', id: 'nord', exits: [{ ref: '1', coordinates: AT }], departures: { status: 'asked' } })
    ).toEqual({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: { ref: '1' }, geometry: { type: 'Point', coordinates: [2.355, 48.88] } }]
    });
  });

  it('are numbered in white Inter Bold of 11 px', () => {
    expect(stationExitsLayers[1]).toEqual({
      id: 'station-exits-numbers',
      type: 'symbol',
      source: 'station-exits',
      minzoom: 15.5,
      layout: {
        'text-field': ['get', 'ref'],
        'text-font': ['Inter Bold'],
        'text-size': 11,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: { 'text-color': '#FFFFFF' }
    });
  });

  it('are none when no station is open', () => {
    expect(exitsData({ status: 'none' }).features).toEqual([]);
  });

  it('grow from 5 px at zoom 14 to 10 px at zoom 17', () => {
    expect(stationExitsLayers[0]?.paint).toHaveProperty(
      ['circle-radius'],
      ['interpolate', ['linear'], ['zoom'], 14, 5, 17, 10]
    );
  });

  it('are numbered from zoom 15.5', () => {
    expect(stationExitsLayers[1]?.minzoom).toBe(15.5);
  });
});

import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { describe, expect, it, onTestFinished } from 'vitest';
import { placeDotAt } from './place-dot-at';

const CENTRE = { longitude: 0, latitude: 0 };

const MIDDLE = { x: 200, y: 150 };

const dotsOf = (image: string): StyleSpecification => ({
  version: 8,
  sources: {
    'place-dots': {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [CENTRE.longitude, CENTRE.latitude] },
            properties: { id: 'chez-camille' }
          }
        ]
      }
    }
  },
  layers: [{ id: 'place-dots', type: 'symbol', source: 'place-dots', layout: { 'icon-image': image } }]
});

const square = (size: number): { width: number; height: number; data: Uint8Array } => ({
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4).fill(255)
});

const drawnMap = async (style: StyleSpecification): Promise<MapLibreMap> => {
  setWorkerUrl(workerUrl);
  const container = document.body.appendChild(document.createElement('div'));
  container.setAttribute('style', 'inline-size: 400px; block-size: 300px');
  const map = new MapLibreMap({ container, style, center: [CENTRE.longitude, CENTRE.latitude], zoom: 15 });
  onTestFinished(() => {
    map.remove();
    container.remove();
  });
  await map.once('style.load');
  return map;
};

const drawnWithDots = async (style: StyleSpecification): Promise<MapLibreMap> => {
  const map = await drawnMap(style);
  map.addImage('small', square(10));
  map.addImage('large', square(40));
  await map.once('idle');
  return map;
};

const touchedAt = async (image: string, x: number, y: number): Promise<string | undefined> =>
  placeDotAt(await drawnWithDots(dotsOf(image)), { x: MIDDLE.x + x, y: MIDDLE.y + y });

describe('the dot of a place touched', () => {
  it('is the dot under the finger', async () => {
    expect(await touchedAt('small', 0, 0)).toBe('chez-camille');
  });

  it('takes in a touch 12 px from a small dot, across or along', async () => {
    expect(await touchedAt('small', 12, -12)).toBe('chez-camille');
  });

  it('leaves out a touch more than 12 px from a small dot', async () => {
    expect(await touchedAt('small', 13, 0)).toBeUndefined();
  });

  it('leaves out a touch more than 12 px from a small dot, the other way', async () => {
    expect(await touchedAt('small', 0, 13)).toBeUndefined();
  });

  it('takes in a touch anywhere on a dot larger than 24 px', async () => {
    expect(await touchedAt('large', 18, 18)).toBe('chez-camille');
  });

  it('is none while the dots are not on the map', async () => {
    expect(placeDotAt(await drawnMap({ version: 8, sources: {}, layers: [] }), MIDDLE)).toBeUndefined();
  });
});

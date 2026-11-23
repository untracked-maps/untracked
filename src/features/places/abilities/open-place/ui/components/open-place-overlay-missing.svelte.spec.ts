import { LngLat, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Observable, of } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import type { PlaceSheet } from '../../domain/open-place';
import { openPlaceOverlay } from './open-place-overlay';

const CENTRE = new LngLat(2.3522, 48.8566);

const LINKED_POINT = { longitude: 2.354, latitude: 48.857 };

const EMPTY_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] };

const shown = (sheet: Observable<PlaceSheet>): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const container = Object.assign(document.createElement('div'), { style: 'inline-size: 400px; block-size: 300px' });
  document.body.append(container);
  const map = new MapLibreMap({ container, style: EMPTY_STYLE, center: CENTRE, zoom: 16 });
  const overlay = openPlaceOverlay(sheet, of('light' as const))(map).subscribe();
  onTestFinished(() => {
    overlay.unsubscribe();
    map.remove();
    container.remove();
  });
  return map;
};

describe('a place a link names that cannot be found', () => {
  it('is marked at the point of the link by a red pin named "Place not found"', async () => {
    shown(of({ status: 'missing', at: LINKED_POINT }));

    await expect.element(page.getByRole('img', { name: 'Place not found' })).toBeInTheDocument();
  });

  it('has its pin standing on the point of the link', async () => {
    const map = shown(of({ status: 'missing', at: LINKED_POINT }));
    await new Promise((loaded) => {
      map.once('load', loaded);
    });
    const pin = page.getByRole('img', { name: 'Place not found' }).element().getBoundingClientRect();
    const frame = map.getContainer().getBoundingClientRect();
    const point = map.project([LINKED_POINT.longitude, LINKED_POINT.latitude]);

    expect([Math.round(pin.left + pin.width / 2 - frame.left), Math.round(pin.bottom - frame.top)]).toEqual([
      Math.round(point.x),
      Math.round(point.y)
    ]);
  });

  it('is not marked when the link has no point', async () => {
    shown(of({ status: 'missing' }));

    await expect.element(page.getByRole('img', { name: 'Place not found' })).not.toBeInTheDocument();
  });
});

describe('a place open with a pictogram, unlike a place that cannot be found', () => {
  it('has its dot centred on the place', async () => {
    const map = shown(
      of({
        status: 'open',
        place: { id: 'flore', name: 'Café de Flore', family: 'cafe', coordinates: LINKED_POINT },
        from: 'link'
      })
    );
    await new Promise((loaded) => {
      map.once('load', loaded);
    });
    const dot = page.getByRole('img', { name: 'Café de Flore' }).element().getBoundingClientRect();
    const frame = map.getContainer().getBoundingClientRect();
    const point = map.project([LINKED_POINT.longitude, LINKED_POINT.latitude]);

    expect(Math.round(dot.top + dot.height / 2 - frame.top)).toBe(Math.round(point.y));
  });
});

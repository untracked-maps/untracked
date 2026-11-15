import { LngLat, Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { BehaviorSubject, type Observable, Subject, type Subscription } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import type { LocateMeStatus } from '../../domain/locate-me';
import { positionOverlay } from './position-overlay';

const NOTRE_DAME = { longitude: 2.3499, latitude: 48.853 };
const CENTRED_ON_NOTRE_DAME: LocateMeStatus = { kind: 'located', view: { center: NOTRE_DAME, zoom: 16 } };
const LOCATING: LocateMeStatus = { kind: 'locating' };

const parisMap = (): MapLibreMap => {
  setWorkerUrl(workerUrl);
  const container = document.createElement('div');
  container.style.setProperty('inline-size', '400px');
  container.style.setProperty('block-size', '300px');
  document.body.append(container);
  const map = new MapLibreMap({
    container,
    style: { version: 8, sources: {}, layers: [] },
    center: [2.3522, 48.8566],
    zoom: 13
  });
  onTestFinished(() => {
    map.remove();
    container.remove();
  });
  return map;
};

const showing = (overlay$: Observable<unknown>): Subscription => {
  const subscription = overlay$.subscribe();
  onTestFinished(() => subscription.unsubscribe());
  return subscription;
};

const lastly = (status: LocateMeStatus): Observable<LocateMeStatus> => new BehaviorSubject(status);

describe('position overlay', () => {
  it('marks the position of the visitor on the map', async () => {
    showing(positionOverlay(lastly(CENTRED_ON_NOTRE_DAME))(parisMap()));

    await expect.element(page.getByRole('img', { name: 'Your position' })).toBeVisible();
  });

  it('marks nothing while the position is on its way', async () => {
    showing(positionOverlay(lastly(LOCATING))(parisMap()));

    await expect.element(page.getByRole('img', { name: 'Your position' })).not.toBeInTheDocument();
  });

  it('flies to the position of the visitor', async () => {
    const map = parisMap();

    showing(positionOverlay(lastly(CENTRED_ON_NOTRE_DAME))(map));

    await expect
      .poll(() => map.getCenter().distanceTo(new LngLat(NOTRE_DAME.longitude, NOTRE_DAME.latitude)), { timeout: 5000 })
      .toBeLessThan(1);
  });

  it('zooms in to the level of the view', async () => {
    const map = parisMap();

    showing(positionOverlay(lastly(CENTRED_ON_NOTRE_DAME))(map));

    await expect.poll(() => map.getZoom(), { timeout: 5000 }).toBe(16);
  });

  it('removes the mark once the map no longer shows it', async () => {
    const overlay = showing(positionOverlay(lastly(CENTRED_ON_NOTRE_DAME))(parisMap()));

    overlay.unsubscribe();

    await expect.element(page.getByRole('img', { name: 'Your position' })).not.toBeInTheDocument();
  });

  it('stops following the position once the map no longer shows it', () => {
    const status$ = new Subject<LocateMeStatus>();
    const map = parisMap();
    const overlay = showing(positionOverlay(status$)(map));

    overlay.unsubscribe();
    status$.next(CENTRED_ON_NOTRE_DAME);

    expect(map.isMoving()).toBe(false);
  });
});

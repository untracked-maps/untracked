import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import type { MapView } from '../../domain/show-map';
import { camerasOf, viewOf } from './camera.presenter';

const scheduler = (): TestScheduler =>
  new TestScheduler((actual, expected) => {
    expect(actual).toStrictEqual(expected);
  });

const PARIS: MapView = { zoom: 13, center: { latitude: 48.8566, longitude: 2.3522 } };

describe('camera presenter', () => {
  it('turns a view into the camera MapLibre expects, longitude first', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(camerasOf(cold('s', { s: { basemap: 'light', view: PARIS } }))).toBe('c', {
        c: { center: [2.3522, 48.8566], zoom: 13 }
      });
    });
  });

  it('leaves the camera where it is when only the basemap changes', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = cold('l-d', { l: { basemap: 'light', view: PARIS }, d: { basemap: 'dark', view: PARIS } });

      expectObservable(camerasOf(scene$)).toBe('c', { c: { center: [2.3522, 48.8566], zoom: 13 } });
    });
  });

  it('turns the centre and zoom of MapLibre back into a view', () => {
    expect(viewOf({ lng: 2.3522, lat: 48.8566 }, 13)).toEqual({ center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 });
  });
});

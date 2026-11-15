import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type MapView, showMap } from './show-map';

const PARIS: MapView = { center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('show map', () => {
  it('opens on Paris with the basemap of the provider', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = showMap({ loadBasemap: () => cold('b|', { b: 'basemap' }) })();

      expectObservable(scene$).toBe('s|', { s: { basemap: 'basemap', view: PARIS } });
    });
  });

  it('waits for the basemap before showing anything', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = showMap({ loadBasemap: () => cold('--b|', { b: 'basemap' }) })();

      expectObservable(scene$).toBe('--s|', { s: { basemap: 'basemap', view: PARIS } });
    });
  });
});

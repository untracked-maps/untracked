import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type MapView, showMap } from './show-map';

const PARIS: MapView = { center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 };
const EIFFEL_TOWER: MapView = { center: { longitude: 2.294_48, latitude: 48.858_37 }, zoom: 17 };

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

  it('opens on the view it is asked for', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = showMap({ loadBasemap: () => cold('b|', { b: 'basemap' }) })(cold('v|', { v: EIFFEL_TOWER }));

      expectObservable(scene$).toBe('s|', { s: { basemap: 'basemap', view: EIFFEL_TOWER } });
    });
  });

  it('opens on Paris when asked for no view', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = showMap({ loadBasemap: () => cold('b|', { b: 'basemap' }) })(cold('|'));

      expectObservable(scene$).toBe('s|', { s: { basemap: 'basemap', view: PARIS } });
    });
  });

  it('waits for the view it is asked for before showing anything', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = showMap({ loadBasemap: () => cold('b|', { b: 'basemap' }) })(cold('--v|', { v: EIFFEL_TOWER }));

      expectObservable(scene$).toBe('--s|', { s: { basemap: 'basemap', view: EIFFEL_TOWER } });
    });
  });

  it('shows each new basemap of the provider in the same view', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scene$ = showMap({ loadBasemap: () => cold('l-d', { l: 'light', d: 'dark' }) })();

      expectObservable(scene$).toBe('l-d', { l: { basemap: 'light', view: PARIS }, d: { basemap: 'dark', view: PARIS } });
    });
  });
});

import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { chooseBasemap } from './choose-basemap';

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

const PHOTOS = 'aerial photos';

describe('choose basemap', () => {
  it('draws no imagery on the plan', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const imagery$ = chooseBasemap({
        chosenBasemap: () => cold('p', { p: 'plan' }),
        loadSatelliteImagery: () => cold('i', { i: PHOTOS })
      })();

      expectObservable(imagery$).toBe('n', { n: undefined });
    });
  });

  it('draws the satellite imagery once the satellite is chosen', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const imagery$ = chooseBasemap({
        chosenBasemap: () => cold('p-s', { p: 'plan', s: 'satellite' }),
        loadSatelliteImagery: () => cold('i', { i: PHOTOS })
      })();

      expectObservable(imagery$).toBe('n-i', { n: undefined, i: PHOTOS });
    });
  });

  it('loads the satellite imagery only once the satellite is chosen', () => {
    scheduler().run(({ cold, expectSubscriptions }) => {
      const photos = cold('i', { i: PHOTOS });
      chooseBasemap({
        chosenBasemap: () => cold('p-s', { p: 'plan', s: 'satellite' }),
        loadSatelliteImagery: () => photos
      })().subscribe();

      expectSubscriptions(photos.subscriptions).toBe('--^');
    });
  });

  it('does not load the satellite imagery again when the satellite is chosen twice', () => {
    scheduler().run(({ cold, expectSubscriptions }) => {
      const photos = cold('i', { i: PHOTOS });
      chooseBasemap({
        chosenBasemap: () => cold('s-s', { s: 'satellite' }),
        loadSatelliteImagery: () => photos
      })().subscribe();

      expectSubscriptions(photos.subscriptions).toBe('^');
    });
  });

  it('stops drawing the imagery once the plan is chosen again', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const imagery$ = chooseBasemap({
        chosenBasemap: () => cold('s-p', { s: 'satellite', p: 'plan' }),
        loadSatelliteImagery: () => cold('i', { i: PHOTOS })
      })();

      expectObservable(imagery$).toBe('i-n', { n: undefined, i: PHOTOS });
    });
  });
});

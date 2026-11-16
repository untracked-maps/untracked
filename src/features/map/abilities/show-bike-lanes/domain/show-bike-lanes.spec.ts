import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { showBikeLanes } from './show-bike-lanes';

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('show bike lanes', () => {
  it('draws no bike lanes until they are shown', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lanes$ = showBikeLanes({ shownBikeLanes: () => cold('h', { h: false }) })(cold('l', { l: 'light' }));

      expectObservable(lanes$).toBe('n', { n: undefined });
    });
  });

  it('draws the bike lanes in the palette of the map once they are shown', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lanes$ = showBikeLanes({ shownBikeLanes: () => cold('h-s', { h: false, s: true }) })(cold('l', { l: 'light' }));

      expectObservable(lanes$).toBe('n-l', { n: undefined, l: 'light' });
    });
  });

  it('draws the bike lanes in the new palette when the map changes its palette', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lanes$ = showBikeLanes({ shownBikeLanes: () => cold('s', { s: true }) })(cold('l-d', { l: 'light', d: 'dark' }));

      expectObservable(lanes$).toBe('l-d', { l: 'light', d: 'dark' });
    });
  });

  it('stays hidden when the map changes its palette', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lanes$ = showBikeLanes({ shownBikeLanes: () => cold('h', { h: false }) })(cold('l-d', { l: 'light', d: 'dark' }));

      expectObservable(lanes$).toBe('n', { n: undefined });
    });
  });

  it('stops drawing the bike lanes once they are hidden', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lanes$ = showBikeLanes({ shownBikeLanes: () => cold('s-h', { h: false, s: true }) })(cold('l', { l: 'light' }));

      expectObservable(lanes$).toBe('l-n', { n: undefined, l: 'light' });
    });
  });
});

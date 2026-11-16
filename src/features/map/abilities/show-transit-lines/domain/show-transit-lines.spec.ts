import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { showTransitLines, type TransitLine } from './show-transit-lines';

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

const METRO_1: TransitLine = {
  mode: 'metro',
  colour: '#ffbe00',
  path: [
    [2.2389, 48.8918],
    [2.4485, 48.8445]
  ]
};

const LINES: readonly TransitLine[] = [METRO_1];

describe('show transit lines', () => {
  it('draws no lines until they are shown', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lines$ = showTransitLines({
        shownTransitLines: () => cold('h', { h: false }),
        loadTransitLines: () => cold('l', { l: LINES })
      })();

      expectObservable(lines$).toBe('n', { n: undefined });
    });
  });

  it('draws the lines once they are shown', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lines$ = showTransitLines({
        shownTransitLines: () => cold('h-s', { h: false, s: true }),
        loadTransitLines: () => cold('l', { l: LINES })
      })();

      expectObservable(lines$).toBe('n-l', { n: undefined, l: LINES });
    });
  });

  it('stops drawing the lines once they are hidden', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lines$ = showTransitLines({
        shownTransitLines: () => cold('s-h', { h: false, s: true }),
        loadTransitLines: () => cold('l', { l: LINES })
      })();

      expectObservable(lines$).toBe('l-n', { n: undefined, l: LINES });
    });
  });

  it('loads the lines only once they are shown', () => {
    scheduler().run(({ cold, expectSubscriptions }) => {
      const loaded = cold('l', { l: LINES });
      showTransitLines({
        shownTransitLines: () => cold('h-s', { h: false, s: true }),
        loadTransitLines: () => loaded
      })().subscribe();

      expectSubscriptions(loaded.subscriptions).toBe('--^');
    });
  });

  it('loads the lines once, however often they are shown', () => {
    scheduler().run(({ cold, expectSubscriptions }) => {
      const loaded = cold('l', { l: LINES });
      showTransitLines({
        shownTransitLines: () => cold('s-h-s', { h: false, s: true }),
        loadTransitLines: () => loaded
      })().subscribe();

      expectSubscriptions(loaded.subscriptions).toBe('^');
    });
  });

  it('draws no lines when they cannot be loaded', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const lines$ = showTransitLines({
        shownTransitLines: () => cold('s', { s: true }),
        loadTransitLines: () => cold<readonly TransitLine[]>('#')
      })();

      expectObservable(lines$).toBe('n', { n: undefined });
    });
  });

  it('tries to load the lines again when they are shown again after a failure', () => {
    scheduler().run(({ cold, expectSubscriptions }) => {
      const failing = cold<readonly TransitLine[]>('#');
      showTransitLines({
        shownTransitLines: () => cold('s-h-s', { h: false, s: true }),
        loadTransitLines: () => failing
      })().subscribe();

      expectSubscriptions(failing.subscriptions).toBe(['(^!)', '----(^!)']);
    });
  });
});

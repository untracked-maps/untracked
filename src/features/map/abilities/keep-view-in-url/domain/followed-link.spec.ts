import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { linkInUrl, linkKept, placesLinked, pointsLinked } from './followed-link';
import type { Linked } from './link-fragment';
import type { MapView } from './view-fragment';

const EIFFEL_TOWER: MapView = { center: { longitude: 2.294_48, latitude: 48.85 }, zoom: 17 };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('link in URL', () => {
  it('is the place or the spot the URL opens', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const link$ = linkInUrl({ readFragment: () => cold('f|', { f: 'map=17/48.5/2.5&point=1' }) })();

      expectObservable(link$).toBe('l|', { l: { kind: 'point', at: { longitude: 2.5, latitude: 48.5 } } });
    });
  });

  it('is nothing when the URL opens nothing', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const link$ = linkInUrl({ readFragment: () => cold('f|', { f: 'map=17/48.85837/2.29448' }) })();

      expectObservable(link$).toBe('-|');
    });
  });
});

describe('link kept in URL', () => {
  const Link: Linked = { kind: 'place', id: 'flore' };

  it('is kept while the sheet the link opens has not opened yet', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      expectObservable(linkKept(cold('(l|)', { l: Link }), hot('f', { f: false }))).toBe('k', { k: true });
    });
  });

  it('is kept while its sheet stays open', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      expectObservable(linkKept(cold('(l|)', { l: Link }), hot('f t', { f: false, t: true }))).toBe('k', { k: true });
    });
  });

  it('is let go once its sheet closes', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      expectObservable(linkKept(cold('(l|)', { l: Link }), hot('f t f t', { f: false, t: true }))).toBe('k 1ms (g|)', {
        k: true,
        g: false
      });
    });
  });

  it('is not kept without a link', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      expectObservable(linkKept(cold('|'), hot('t', { t: true }))).toBe('(g|)', { g: false });
    });
  });
});

describe('what a link opens', () => {
  const Place: Linked = { kind: 'place', id: 'flore', at: EIFFEL_TOWER.center };
  const Point: Linked = { kind: 'point', at: EIFFEL_TOWER.center };

  it('is the place it names, opened from a link, with its position', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(placesLinked(cold('(l|)', { l: Place }))).toBe('(p|)', {
        p: { id: 'flore', from: 'link', at: EIFFEL_TOWER.center }
      });
    });
  });

  it('is the place it names, without a position when it has none', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(placesLinked(cold('(l|)', { l: { kind: 'place', id: 'flore' } }))).toBe('(p|)', {
        p: { id: 'flore', from: 'link' }
      });
    });
  });

  it('is no place for a link to a spot', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(placesLinked(cold('(l|)', { l: Point }))).toBe('|');
    });
  });

  it('is the spot it marks', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(pointsLinked(cold('(l|)', { l: Point }))).toBe('(p|)', { p: EIFFEL_TOWER.center });
    });
  });

  it('is no spot for a link to a place', () => {
    scheduler().run(({ cold, expectObservable }) => {
      expectObservable(pointsLinked(cold('(l|)', { l: Place }))).toBe('|');
    });
  });
});

import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { keepViewInUrl, viewInUrl } from './keep-view-in-url';
import type { MapView } from './view-fragment';

const EIFFEL_TOWER: MapView = { center: { longitude: 2.294_48, latitude: 48.858_37 }, zoom: 17 };
const LOUVRE: MapView = { center: { longitude: 2.3376, latitude: 48.8606 }, zoom: 16 };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('view in URL', () => {
  it('is the view the URL asks for', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const view$ = viewInUrl({ readFragment: () => cold('f|', { f: 'map=17/48.85837/2.29448' }) })();

      expectObservable(view$).toBe('v|', { v: EIFFEL_TOWER });
    });
  });

  it('is nothing when the URL asks for no view', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const view$ = viewInUrl({ readFragment: () => cold('f|', { f: '' }) })();

      expectObservable(view$).toBe('-|');
    });
  });

  it('is nothing when the URL asks for an invalid view', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const view$ = viewInUrl({ readFragment: () => cold('f|', { f: 'map=99/48.85837/2.29448' }) })();

      expectObservable(view$).toBe('-|');
    });
  });
});

describe('keep view in URL', () => {
  it('keeps the view in the URL once the map has settled for 300 ms', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('(w|)', { w: fragment }) })(
        hot('v', { v: EIFFEL_TOWER })
      );

      expectObservable(kept$).toBe('300ms f', { f: 'map=17/48.85837/2.29448' });
    });
  });

  it('keeps only the last of quick moves', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('(w|)', { w: fragment }) })(
        hot('a 100ms b', { a: EIFFEL_TOWER, b: LOUVRE })
      );

      expectObservable(kept$).toBe('401ms f', { f: 'map=16/48.8606/2.3376' });
    });
  });

  it('does not write the URL again when the view has not changed', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('(w|)', { w: fragment }) })(
        hot('a 400ms b', { a: EIFFEL_TOWER, b: EIFFEL_TOWER })
      );

      expectObservable(kept$).toBe('300ms f', { f: 'map=17/48.85837/2.29448' });
    });
  });

  it('writes each new view in turn, once the previous one is written', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('500ms (w|)', { w: fragment }) })(
        hot('a 300ms b', { a: EIFFEL_TOWER, b: LOUVRE })
      );

      expectObservable(kept$).toBe('800ms f 499ms l', { f: 'map=17/48.85837/2.29448', l: 'map=16/48.8606/2.3376' });
    });
  });
});

describe('keep view in URL, after a step in the history', () => {
  it('writes the view again, on the entry the history stepped to', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('(w|)', { w: fragment }) })(
        hot('v', { v: EIFFEL_TOWER }),
        hot('400ms s')
      );

      expectObservable(kept$).toBe('300ms f 99ms f', { f: 'map=17/48.85837/2.29448' });
    });
  });

  it('writes the last view only', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('(w|)', { w: fragment }) })(
        hot('a 400ms b', { a: EIFFEL_TOWER, b: LOUVRE }),
        hot('900ms s')
      );

      expectObservable(kept$).toBe('300ms f 400ms l 198ms l', { f: 'map=17/48.85837/2.29448', l: 'map=16/48.8606/2.3376' });
    });
  });

  it('writes nothing while the map has not moved', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const kept$ = keepViewInUrl({ writeFragment: (fragment) => cold('(w|)', { w: fragment }) })(hot(''), hot('s'));

      expectObservable(kept$).toBe('');
    });
  });
});

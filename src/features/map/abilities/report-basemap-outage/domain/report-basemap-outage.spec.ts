import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type BasemapEvent, reportBasemapOutage } from './report-basemap-outage';

const EVENTS: Readonly<Record<string, BasemapEvent>> = { l: 'tile-loaded', f: 'tile-failed', s: 'source-failed' };
const STATES: Readonly<Record<string, boolean>> = { a: false, o: true };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('report basemap outage', () => {
  it('reports no outage before the basemap says anything', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('-|', EVENTS) })();

      expectObservable(outage$).toBe('a|', STATES);
    });
  });

  it('reports no outage while tiles load', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('lll|', EVENTS) })();

      expectObservable(outage$).toBe('a--|', STATES);
    });
  });

  it('reports no outage after two tiles failed in a row', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('ff|', EVENTS) })();

      expectObservable(outage$).toBe('a-|', STATES);
    });
  });

  it('reports an outage once three tiles failed in a row', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('fff|', EVENTS) })();

      expectObservable(outage$).toBe('a-o|', STATES);
    });
  });

  it('forgives failed tiles once a tile loads', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('fflff|', EVENTS) })();

      expectObservable(outage$).toBe('a----|', STATES);
    });
  });

  it('reports an outage at once when the source of the basemap fails', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('-s|', EVENTS) })();

      expectObservable(outage$).toBe('ao|', STATES);
    });
  });

  it('ends the outage as soon as a tile loads again', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('fffl|', EVENTS) })();

      expectObservable(outage$).toBe('a-oa|', STATES);
    });
  });

  it('reports a new outage when tiles fail again after the basemap came back', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('-slfff|', EVENTS) })();

      expectObservable(outage$).toBe('aoa--o|', STATES);
    });
  });

  it('does not repeat an outage it already reported', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const outage$ = reportBasemapOutage({ basemapEvents: () => cold('ffffs|', EVENTS) })();

      expectObservable(outage$).toBe('a-o--|', STATES);
    });
  });
});

import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type Located, type LocateMeStatus, type LocateResult, locateMe } from './locate-me';

const NOTRE_DAME: Located = { kind: 'located', position: { longitude: 2.3499, latitude: 48.853 } };
const LOCATING: LocateMeStatus = { kind: 'locating' };
const CENTRED_ON_NOTRE_DAME: LocateMeStatus = {
  kind: 'located',
  view: { center: { longitude: 2.3499, latitude: 48.853 }, zoom: 16 }
};
const DENIED: LocateResult = { kind: 'permission-denied' };
const UNAVAILABLE: LocateResult = { kind: 'position-unavailable' };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('locate me', () => {
  it('says nothing until the visitor asks to be located', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const status$ = locateMe({ locate: () => cold('p|', { p: NOTRE_DAME }) })(hot('---'));

      expectObservable(status$).toBe('---');
    });
  });

  it('looks for the position as soon as the visitor asks', () => {
    scheduler().run(({ hot, expectObservable }) => {
      const status$ = locateMe({ locate: () => hot('---') })(hot('-r', { r: undefined }));

      expectObservable(status$).toBe('-l', { l: LOCATING });
    });
  });

  it('centres the map on the position at street level once it arrives', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const status$ = locateMe({ locate: () => cold('--p|', { p: NOTRE_DAME }) })(hot('-r', { r: undefined }));

      expectObservable(status$).toBe('-l-c', { l: LOCATING, c: CENTRED_ON_NOTRE_DAME });
    });
  });

  it('tells the visitor they refused to share their position', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const status$ = locateMe({ locate: () => cold('-d|', { d: DENIED }) })(hot('-r', { r: undefined }));

      expectObservable(status$).toBe('-ld', { l: LOCATING, d: DENIED });
    });
  });

  it('tells the visitor their position cannot be found', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const status$ = locateMe({ locate: () => cold('-u|', { u: UNAVAILABLE }) })(hot('-r', { r: undefined }));

      expectObservable(status$).toBe('-lu', { l: LOCATING, u: UNAVAILABLE });
    });
  });

  it('forgets a position still on its way when the visitor asks again', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const status$ = locateMe({ locate: () => cold('--p|', { p: NOTRE_DAME }) })(hot('-rr', { r: undefined }));

      expectObservable(status$).toBe('-ll-c', { l: LOCATING, c: CENTRED_ON_NOTRE_DAME });
    });
  });

  it('asks for the position once, however many parts of the page watch it', () => {
    scheduler().run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const position$ = cold('-p|', { p: NOTRE_DAME });
      const status$ = locateMe({ locate: () => position$ })(hot('-r', { r: undefined }));

      expectObservable(status$);
      expectObservable(status$);

      expectSubscriptions(position$.subscriptions).toBe('-^-!');
    });
  });
});

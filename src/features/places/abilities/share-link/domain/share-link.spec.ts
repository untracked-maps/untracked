import { type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { type SharedLink, shareLink } from './share-link';

const FLORE: SharedLink = { title: 'Café de Flore', url: 'https://example.org/#map=17/48.85/2.33&place=flore' };

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

const refused = (): Observable<never> => throwError(() => new Error('Refused.'));

describe('share a link', () => {
  it('is shared by the share sheet', () => {
    scheduler().run(({ hot, expectObservable }) => {
      const shared$ = shareLink({ shareUrl: () => of('shared' as const), copyText: refused })(hot('l', { l: FLORE }));

      expectObservable(shared$).toBe('s', { s: 'shared' });
    });
  });

  it('gives the share sheet the title and the link', () => {
    const given: SharedLink[] = [];
    shareLink({
      shareUrl: (link) => {
        given.push(link);
        return of('shared' as const);
      },
      copyText: refused
    })(of(FLORE)).subscribe();

    expect(given).toEqual([FLORE]);
  });

  it('is cancelled when the visitor closes the share sheet', () => {
    scheduler().run(({ hot, expectObservable }) => {
      const shared$ = shareLink({ shareUrl: () => of('cancelled' as const), copyText: refused })(hot('l', { l: FLORE }));

      expectObservable(shared$).toBe('c', { c: 'cancelled' });
    });
  });

  it('is copied when the share sheet fails', () => {
    scheduler().run(({ hot, expectObservable }) => {
      const shared$ = shareLink({ shareUrl: refused, copyText: () => of(undefined) })(hot('l', { l: FLORE }));

      expectObservable(shared$).toBe('c', { c: 'copied' });
    });
  });

  it('is copied without a share sheet', () => {
    scheduler().run(({ hot, expectObservable }) => {
      const shared$ = shareLink({ copyText: () => of(undefined) })(hot('l', { l: FLORE }));

      expectObservable(shared$).toBe('c', { c: 'copied' });
    });
  });

  it('copies the link alone', () => {
    const copied: string[] = [];
    shareLink({
      copyText: (text) => {
        copied.push(text);
        return of(undefined);
      }
    })(of(FLORE)).subscribe();

    expect(copied).toEqual([FLORE.url]);
  });

  it('is told copied once the copy is done', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const shared$ = shareLink({ copyText: () => cold('5ms (u|)', { u: undefined }) })(hot('l', { l: FLORE }));

      expectObservable(shared$).toBe('5ms c', { c: 'copied' });
    });
  });

  it('is not copied when the device refuses', () => {
    scheduler().run(({ hot, expectObservable }) => {
      const shared$ = shareLink({ copyText: refused })(hot('l', { l: FLORE }));

      expectObservable(shared$).toBe('n', { n: 'not copied' });
    });
  });

  it('shares each link in turn', () => {
    scheduler().run(({ cold, hot, expectObservable }) => {
      const shared$ = shareLink({ shareUrl: () => cold('10ms (s|)', { s: 'shared' as const }), copyText: refused })(
        hot('ll', { l: FLORE })
      );

      expectObservable(shared$).toBe('10ms s 9ms s', { s: 'shared' });
    });
  });
});

import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { suggestLanguage } from './suggest-language';

const AVAILABLE: readonly string[] = ['en', 'fr'];

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('suggest language', () => {
  it('suggests the preferred language while the banner is not dismissed', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const suggestion$ = suggestLanguage({
        preferredLanguages: () => cold('a', { a: ['fr-FR'] }),
        dismissed: () => cold('n', { n: false })
      })(AVAILABLE, 'en');

      expectObservable(suggestion$).toBe('s', { s: 'fr' });
    });
  });

  it('withdraws the suggestion once the banner is dismissed', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const suggestion$ = suggestLanguage({
        preferredLanguages: () => cold('a', { a: ['fr-FR'] }),
        dismissed: () => cold('n--y', { n: false, y: true })
      })(AVAILABLE, 'en');

      expectObservable(suggestion$).toBe('s--u', { s: 'fr', u: undefined });
    });
  });

  it('does not repeat the same suggestion', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const suggestion$ = suggestLanguage({
        preferredLanguages: () => cold('a-b', { a: ['fr-FR'], b: ['fr-CA'] }),
        dismissed: () => cold('n', { n: false })
      })(AVAILABLE, 'en');

      expectObservable(suggestion$).toBe('s', { s: 'fr' });
    });
  });
});

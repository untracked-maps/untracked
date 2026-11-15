import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { chooseTheme } from './choose-theme';

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('choose theme', () => {
  it('shows the colour scheme the device prefers with the system theme', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scheme$ = chooseTheme({
        chosenTheme: () => cold('s', { s: 'system' }),
        preferredColourScheme: () => cold('d', { d: 'dark' })
      })();

      expectObservable(scheme$).toBe('d', { d: 'dark' });
    });
  });

  it('shows the chosen theme whatever the device prefers', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scheme$ = chooseTheme({
        chosenTheme: () => cold('l', { l: 'light' }),
        preferredColourScheme: () => cold('d', { d: 'dark' })
      })();

      expectObservable(scheme$).toBe('l', { l: 'light' });
    });
  });

  it('follows the device when it changes its colour scheme under the system theme', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scheme$ = chooseTheme({
        chosenTheme: () => cold('s', { s: 'system' }),
        preferredColourScheme: () => cold('l--d', { l: 'light', d: 'dark' })
      })();

      expectObservable(scheme$).toBe('l--d', { l: 'light', d: 'dark' });
    });
  });

  it('ignores the device changing its colour scheme under a chosen theme', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scheme$ = chooseTheme({
        chosenTheme: () => cold('d', { d: 'dark' }),
        preferredColourScheme: () => cold('l--d', { l: 'light', d: 'dark' })
      })();

      expectObservable(scheme$).toBe('d', { d: 'dark' });
    });
  });

  it('switches as soon as the visitor chooses another theme', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const scheme$ = chooseTheme({
        chosenTheme: () => cold('s-d-l', { s: 'system', d: 'dark', l: 'light' }),
        preferredColourScheme: () => cold('l', { l: 'light' })
      })();

      expectObservable(scheme$).toBe('l-d-l', { l: 'light', d: 'dark' });
    });
  });
});

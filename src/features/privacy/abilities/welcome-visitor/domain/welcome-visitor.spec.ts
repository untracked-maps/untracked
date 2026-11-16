import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { welcomeVisitor } from './welcome-visitor';

const scheduler = (): TestScheduler => new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('welcome visitor', () => {
  it('welcomes a visitor who has not acknowledged the welcome', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const welcome$ = welcomeVisitor({ acknowledged: () => cold('n', { n: false }) })();

      expectObservable(welcome$).toBe('w', { w: true });
    });
  });

  it('withdraws the welcome once the visitor acknowledges it', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const welcome$ = welcomeVisitor({ acknowledged: () => cold('n--y', { n: false, y: true }) })();

      expectObservable(welcome$).toBe('w--h', { w: true, h: false });
    });
  });

  it('does not repeat the same welcome', () => {
    scheduler().run(({ cold, expectObservable }) => {
      const welcome$ = welcomeVisitor({ acknowledged: () => cold('n-n', { n: false }) })();

      expectObservable(welcome$).toBe('w', { w: true });
    });
  });
});

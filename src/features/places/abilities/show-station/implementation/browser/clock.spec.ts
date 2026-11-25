import { take, toArray } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { describe, expect, it } from 'vitest';
import { clock } from './clock';

describe('the clock', () => {
  it('tells the time at once, then every second', () => {
    new TestScheduler((actual, wanted) => expect(actual).toEqual(wanted)).run(({ expectObservable }) => {
      const times = [1, 2, 3];
      expectObservable(clock(() => times.shift() ?? 0).pipe(take(3), toArray())).toBe('2s (t|)', { t: [1, 2, 3] });
    });
  });
});

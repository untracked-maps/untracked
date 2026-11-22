import { from, lastValueFrom, type ObservedValueOf, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { backdropShare, releasedAt, type SwipeEvent, swipeClosed, swipeOf, swipeOffset } from './dialog-swipe';

type DialogSwipe = ObservedValueOf<ReturnType<typeof swipeOf>>;

type Move = readonly [dx: number, dy: number];

type EventOf<Kind extends SwipeEvent['kind']> = Extract<SwipeEvent, { readonly kind: Kind }>;

const touched = (allowed = true): EventOf<'touched'> => ({
  kind: 'touched',
  x: 100,
  y: 200,
  time: 1000,
  allowed
});

const moved = ([dx, dy]: Move): EventOf<'moved'> => ({ kind: 'moved', x: 100 + dx, y: 200 + dy });

const released = (after: number): EventOf<'released'> => ({ kind: 'released', time: 1000 + after });

const left = (events: readonly SwipeEvent[]): Promise<DialogSwipe> => lastValueFrom(swipeOf(from(events)));

const offsetAfter = async (...moves: readonly Move[]): Promise<number> =>
  swipeOffset(await left([touched(), ...moves.map(moved)]));

const closingAfter = async (dy: number, milliseconds: number): Promise<boolean> =>
  (await left([touched(), moved([0, dy]), released(milliseconds)])).closing;

describe('a finger on a window', () => {
  it('leaves the window in place at first', async () => {
    await expect(left([]).then(swipeOffset)).resolves.toBe(0);
  });

  it('moves the window down with it', async () => {
    await expect(offsetAfter([0, 50])).resolves.toBe(50);
  });

  it('does not move the window until it went down more than 6 px', async () => {
    await expect(offsetAfter([0, 6])).resolves.toBe(0);
  });

  it('moves the window once it went down 7 px', async () => {
    await expect(offsetAfter([0, 7])).resolves.toBe(7);
  });
});

describe('a finger on a window that does not swipe it', () => {
  it('does not move the window when it goes more sideways than down', async () => {
    await expect(offsetAfter([20, 10])).resolves.toBe(0);
  });

  it('does not move the window when it goes as much sideways as down', async () => {
    await expect(offsetAfter([10, 10])).resolves.toBe(0);
  });

  it('never moves the window once it went sideways first', async () => {
    await expect(offsetAfter([20, 10], [20, 100])).resolves.toBe(0);
  });

  it('never moves the window once it went up first', async () => {
    await expect(offsetAfter([0, -20], [0, 100])).resolves.toBe(0);
  });

  it('keeps the window waiting while it stays within 6 px', async () => {
    await expect(offsetAfter([3, -4], [0, 50])).resolves.toBe(50);
  });

  it('never moves the window above where it opened', async () => {
    await expect(offsetAfter([0, 50], [0, -20])).resolves.toBe(0);
  });

  it('does not move the window when the touch began where a swipe is not allowed', async () => {
    await expect(left([touched(false), moved([0, 50])]).then(swipeOffset)).resolves.toBe(0);
  });

  it('does not move the window when nothing touched it first', async () => {
    await expect(left([moved([0, 50])]).then(swipeOffset)).resolves.toBe(0);
  });
});

describe('the backdrop of a window swiped down', () => {
  it('stays whole while nothing moves', async () => {
    await expect(left([]).then(backdropShare)).resolves.toBe(1);
  });

  it('fades as the window goes down', async () => {
    await expect(left([touched(), moved([0, 100])]).then(backdropShare)).resolves.toBe(0.75);
  });

  it('never fades below 30 %', async () => {
    await expect(left([touched(), moved([0, 300])]).then(backdropShare)).resolves.toBe(0.3);
  });
});

describe('a finger lifted from a window', () => {
  it('closes the window after 120 px in 400 ms', async () => {
    await expect(closingAfter(120, 400)).resolves.toBe(true);
  });

  it('closes the window after 50 px in 60 ms', async () => {
    await expect(closingAfter(50, 60)).resolves.toBe(true);
  });

  it('brings the window back after 50 px in 400 ms', async () => {
    await expect(closingAfter(50, 400)).resolves.toBe(false);
  });
});

describe('a finger lifted from a window, at the limits', () => {
  it('closes the window after 91 px, however slow', async () => {
    await expect(closingAfter(91, 5000)).resolves.toBe(true);
  });

  it('brings the window back after 90 px, slow', async () => {
    await expect(closingAfter(90, 5000)).resolves.toBe(false);
  });

  it('brings the window back after 30 px, however fast', async () => {
    await expect(closingAfter(30, 10)).resolves.toBe(false);
  });

  it('closes the window after 31 px, fast', async () => {
    await expect(closingAfter(31, 60)).resolves.toBe(true);
  });

  it('brings the window back at exactly 0.5 px/ms', async () => {
    await expect(closingAfter(50, 100)).resolves.toBe(false);
  });
});

describe('a finger lifted from a window that stays', () => {
  it('puts the window back where it opened when it does not close', async () => {
    await expect(left([touched(), moved([0, 50]), released(400)]).then(swipeOffset)).resolves.toBe(0);
  });

  it('does not close the window when it never swiped', async () => {
    await expect(left([touched(), moved([20, 10]), released(10)]).then(({ closing }) => closing)).resolves.toBe(false);
  });

  it('ignores the moves after it', async () => {
    await expect(left([touched(), released(10), moved([0, 50])]).then(swipeOffset)).resolves.toBe(0);
  });

  it('forgets a closing once the window opens again', async () => {
    await expect(
      left([touched(), moved([0, 120]), released(400), { kind: 'toggled' }]).then(({ closing }) => closing)
    ).resolves.toBe(false);
  });
});

describe('a window swiped away', () => {
  const closings = (events: readonly SwipeEvent[]): Promise<readonly unknown[]> =>
    lastValueFrom(swipeClosed(swipeOf(from(events)), () => 0).pipe(toArray()));

  it('is asked to close once', async () => {
    await expect(
      closings([touched(), moved([0, 120]), released(400), moved([0, 130])]).then(({ length }) => length)
    ).resolves.toBe(1);
  });

  it('is asked to close again once opened and swiped away again', async () => {
    const swipedAway = [touched(), moved([0, 120]), released(400)];

    await expect(closings([...swipedAway, { kind: 'toggled' }, ...swipedAway]).then(({ length }) => length)).resolves.toBe(2);
  });

  it('is not asked to close when it comes back', async () => {
    await expect(closings([touched(), moved([0, 50]), released(400)]).then(({ length }) => length)).resolves.toBe(0);
  });
});

describe('the event of a finger lifted from a window', () => {
  it('tells when the finger was lifted', () => {
    expect(releasedAt(420)).toEqual({ kind: 'released', time: 420 });
  });
});

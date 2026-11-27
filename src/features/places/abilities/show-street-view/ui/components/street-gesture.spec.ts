import { from, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type StreetGesture, type StreetGestureEvent, streetGesture } from './street-gesture';

const at = (x: number, y: number): StreetGestureEvent & { readonly kind: 'moved' } => ({ kind: 'moved', points: [{ x, y }] });

const touchedAt = (x: number, y: number): StreetGestureEvent => ({ kind: 'touched', points: [{ x, y }] });

const RELEASED: StreetGestureEvent = { kind: 'released' };

const gestureAfter = (...events: readonly StreetGestureEvent[]): Promise<StreetGesture> =>
  lastValueFrom(streetGesture(from(events)));

describe('a gesture on the street view', () => {
  it('rests before any touch', async () => {
    expect(await gestureAfter()).toEqual({ from: undefined, swipe: 'undecided', drop: 0, closing: false });
  });

  it('starts where the finger touches', async () => {
    expect((await gestureAfter(touchedAt(10, 20))).from).toEqual({ x: 10, y: 20 });
  });

  it('follows a finger that drops', async () => {
    expect(await gestureAfter(touchedAt(100, 100), at(100, 160))).toEqual({
      from: { x: 100, y: 100 },
      swipe: 'dropping',
      drop: 60,
      closing: false
    });
  });

  it('keeps dropping when the finger goes aside afterwards', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(100, 160), at(300, 170))).drop).toBe(70);
  });
});

describe('a sideways gesture on the street view', () => {
  it('lets the picture scroll when the finger goes aside', async () => {
    expect(await gestureAfter(touchedAt(100, 100), at(160, 100))).toEqual({
      from: { x: 100, y: 100 },
      swipe: 'scrolling',
      drop: 0,
      closing: false
    });
  });

  it('keeps scrolling when the finger goes down afterwards', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(160, 100), at(160, 400))).swipe).toBe('scrolling');
  });

  it('waits while the finger stays close', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(105, 110))).swipe).toBe('undecided');
  });
});

describe('a finger lifted from the street view', () => {
  it('closes it past 110 px down', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(100, 220), RELEASED)).closing).toBe(true);
  });

  it('rests again after a drop', async () => {
    expect(await gestureAfter(touchedAt(100, 100), at(100, 220), RELEASED)).toMatchObject({ from: undefined, drop: 0 });
  });

  it('leaves it open 110 px down', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(100, 210), RELEASED)).closing).toBe(false);
  });

  it('leaves it open after a scroll that also goes 115 px down', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(300, 215), RELEASED)).closing).toBe(false);
  });

  it('leaves it open after a long scroll', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(400, 100), RELEASED)).closing).toBe(false);
  });
});

describe('a touch the street view ignores', () => {
  it('is made with two fingers', async () => {
    expect(
      await gestureAfter(
        {
          kind: 'touched',
          points: [
            { x: 100, y: 100 },
            { x: 200, y: 100 }
          ]
        },
        at(100, 300)
      )
    ).toEqual({ from: undefined, swipe: 'undecided', drop: 0, closing: false });
  });

  it('is a move without a finger', async () => {
    expect((await gestureAfter(touchedAt(100, 100), { kind: 'moved', points: [] })).swipe).toBe('undecided');
  });

  it('is a touch without a finger', async () => {
    expect((await gestureAfter({ kind: 'touched', points: [] }, at(100, 300))).swipe).toBe('undecided');
  });

  it('forgets everything on reset', async () => {
    expect(await gestureAfter(touchedAt(100, 100), at(100, 220), { kind: 'reset' })).toEqual({
      from: undefined,
      swipe: 'undecided',
      drop: 0,
      closing: false
    });
  });

  it('closes no more once touched again', async () => {
    expect((await gestureAfter(touchedAt(100, 100), at(100, 220), RELEASED, touchedAt(50, 50))).closing).toBe(false);
  });
});

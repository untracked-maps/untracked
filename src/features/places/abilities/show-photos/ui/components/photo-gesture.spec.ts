import { from, lastValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { fadeOf, type GestureEvent, isZoomed, type PhotoGesture, photoGesture } from './photo-gesture';

type At = readonly [x: number, y: number];

const SIZE = { width: 400, height: 800 };

const touch = (time: number, ...points: readonly At[]): GestureEvent => ({
  kind: 'touched',
  points: points.map(([x, y]) => ({ x, y })),
  time,
  size: SIZE
});

const move = (...points: readonly At[]): GestureEvent => ({ kind: 'moved', points: points.map(([x, y]) => ({ x, y })) });

const release = (...points: readonly At[]): GestureEvent => ({ kind: 'released', points: points.map(([x, y]) => ({ x, y })) });

const RESTING: PhotoGesture = {
  hold: { kind: 'none' },
  scale: 1,
  pan: { x: 0, y: 0 },
  drop: 0,
  lastTouch: undefined,
  closing: false,
  size: { width: 0, height: 0 }
};

const gestureAfter = (events: readonly GestureEvent[]): Promise<PhotoGesture> => lastValueFrom(photoGesture(from(events)));

const ZOOMED: readonly GestureEvent[] = [touch(0, [200, 400]), release(), touch(200, [200, 400]), release()];

const PINCHED: readonly GestureEvent[] = [touch(0, [100, 400], [200, 400]), move([50, 400], [250, 400])];

describe('swiping a photo down', () => {
  it.each([
    ['follows the finger past 12 px', [touch(0, [100, 100]), move([105, 130])], 30],
    ['waits for 12 px', [touch(0, [100, 100]), move([100, 112])], 0],
    ['is not more sideways than 1.3 times down', [touch(0, [100, 100]), move([120, 126]), move([120, 200])], 0],
    ['is down just past 1.3 times sideways', [touch(0, [100, 100]), move([120, 127])], 27],
    ['is not up', [touch(0, [100, 100]), move([100, 60]), move([100, 200])], 0],
    ['never goes above its start', [touch(0, [100, 100]), move([100, 150]), move([100, 80])], 0],
    ['comes back when released', [touch(0, [100, 100]), move([100, 150]), release()], 0],
    ['ignores a move after the finger is lifted', [touch(0, [100, 100]), release(), move([100, 300])], 0],
    ['is not possible on a zoomed photo', [...ZOOMED, touch(1000, [200, 100]), move([200, 300])], 0]
  ] as const)('%s', async (_, events, drop) => {
    expect((await gestureAfter(events)).drop).toBe(drop);
  });

  it.each([
    ['half way to 500 px', [touch(0, [100, 100]), move([100, 350])], 0.5],
    ['never below 0.3', [touch(0, [100, 0]), move([100, 600])], 0.3]
  ] as const)('fades the photo %s', async (_, events, fade) => {
    expect(fadeOf(await gestureAfter(events))).toBe(fade);
  });

  it.each([
    ['closes the viewer released past 110 px', [touch(0, [100, 100]), move([100, 211]), release()], true],
    ['keeps it open released at 110 px', [touch(0, [100, 100]), move([100, 210]), release()], false],
    ['is forgotten at the next touch', [touch(0, [100, 100]), move([100, 211]), release(), touch(1000, [100, 100])], false]
  ] as const)('%s', async (_, events, closing) => {
    expect((await gestureAfter(events)).closing).toBe(closing);
  });
});

describe('zooming a photo', () => {
  it.each([
    ['twice within 280 ms', ZOOMED, 2.5],
    ['twice 280 ms apart', [touch(0, [200, 400]), release(), touch(280, [200, 400])], 1],
    ['twice again, back to its size', [...ZOOMED, touch(1000, [200, 400]), release(), touch(1100, [200, 400])], 1],
    ['a third time soon after, as a new first touch', [...ZOOMED, touch(250, [200, 400])], 2.5],
    ['by pinching it', PINCHED, 2],
    ['by pinching it no more than 5 times', [touch(0, [190, 400], [210, 400]), move([0, 400], [400, 400])], 5],
    ['by pinching it no less than its size', [touch(0, [100, 400], [300, 400]), move([190, 400], [210, 400])], 1],
    ['by pinching it from the zoom it had', [...ZOOMED, touch(1000, [100, 400], [200, 400]), move([80, 400], [220, 400])], 3.5],
    ['only once the second finger moves', [touch(0, [100, 400], [200, 400]), move([100, 400])], 1],
    ['not with two fingers on one point', [touch(0, [100, 400], [100, 400]), move([50, 400], [250, 400])], 1],
    [
      'not with a pinch between two touches',
      [touch(0, [200, 400]), release(), touch(100, [100, 400], [200, 400]), release(), touch(150, [200, 400])],
      1
    ]
  ] as const)('%s', async (_, events, scale) => {
    expect((await gestureAfter(events)).scale).toBe(scale);
  });

  it.each([
    ['a zoomed photo is zoomed', ZOOMED, true],
    ['a photo at its size is not', [], false]
  ] as const)('tells that %s', async (_, events, zoomed) => {
    expect(isZoomed(await gestureAfter(events))).toBe(zoomed);
  });
});

describe('moving a zoomed photo', () => {
  it.each([
    ['with the finger', [...ZOOMED, touch(1000, [200, 400]), move([150, 420])], [-50, 20]],
    ['within the screen sideways', [...ZOOMED, touch(1000, [200, 400]), move([-900, 400])], [-300, 0]],
    ['within the screen up and down', [...ZOOMED, touch(1000, [200, 400]), move([200, 2000])], [0, 600]],
    ['where it stays once released', [...ZOOMED, touch(1000, [200, 400]), move([150, 420]), release()], [-50, 20]],
    [
      'back to the middle once zoomed out',
      [...ZOOMED, touch(1000, [200, 400]), move([150, 420]), release(), touch(1100, [150, 420])],
      [0, 0]
    ],
    ['with the finger left after a pinch', [...PINCHED, release([250, 400]), move([230, 400])], [-20, 0]],
    ['not after a pinch back to its size', [touch(0, [100, 400], [200, 400]), release([200, 400]), move([100, 300])], [0, 0]]
  ] as const)('%s', async (_, events, [x, y]) => {
    expect((await gestureAfter(events)).pan).toEqual({ x, y });
  });
});

describe('a photo gesture', () => {
  it('starts again when the photo changes', async () => {
    expect(await gestureAfter([...ZOOMED, { kind: 'reset' }])).toEqual({ ...RESTING, size: SIZE });
  });

  it('ignores a touch without a point', async () => {
    expect(await gestureAfter([touch(0)])).toEqual(RESTING);
  });

  it('ignores a move without a point', async () => {
    expect(await gestureAfter([touch(0, [100, 100]), move()])).toEqual(await gestureAfter([touch(0, [100, 100])]));
  });

  it('ignores a move once the photo scrolls sideways', async () => {
    expect(await gestureAfter([touch(0, [100, 100]), move([200, 100]), move([100, 300])])).toEqual(
      await gestureAfter([touch(0, [100, 100]), move([200, 100])])
    );
  });

  it('starts at rest', async () => {
    expect(await gestureAfter([])).toEqual(RESTING);
  });
});

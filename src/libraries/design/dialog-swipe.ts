import { distinctUntilKeyChanged, filter, mergeMap, type Observable, scan, shareReplay, startWith, timer } from 'rxjs';

type SwipeStart = {
  readonly x: number;
  readonly y: number;
  readonly time: number;
};

type DialogSwipe = {
  readonly start: SwipeStart | undefined;
  readonly follows: boolean | undefined;
  readonly dy: number;
  readonly closing: boolean;
};

type SwipeEvent =
  | { readonly kind: 'touched'; readonly x: number; readonly y: number; readonly time: number; readonly allowed: boolean }
  | { readonly kind: 'moved'; readonly x: number; readonly y: number }
  | { readonly kind: 'released'; readonly time: number }
  | { readonly kind: 'toggled' };

const releasedAt = (time: number): SwipeEvent => ({ kind: 'released', time });

const SLOP = 6;

const CLOSING_DISTANCE = 90;

const FLICK_DISTANCE = 30;

const FLICK_SPEED = 0.5;

const FADE_DISTANCE = 400;

const FAINTEST_BACKDROP = 0.3;

const RESTING: DialogSwipe = { start: undefined, follows: undefined, dy: 0, closing: false };

const decided = (dx: number, dy: number): boolean | undefined =>
  Math.max(Math.abs(dx), Math.abs(dy)) > SLOP ? dy > Math.abs(dx) : undefined;

const moved = (swipe: DialogSwipe, start: SwipeStart, x: number, y: number): DialogSwipe => {
  const dx = x - start.x;
  const dy = y - start.y;
  const follows = swipe.follows ?? decided(dx, dy);
  return { ...swipe, follows, dy: follows === true ? Math.max(dy, 0) : 0 };
};

const closes = ({ dy }: DialogSwipe, start: SwipeStart, time: number): boolean =>
  dy > CLOSING_DISTANCE || (dy > FLICK_DISTANCE && dy / (time - start.time) > FLICK_SPEED);

const released = (swipe: DialogSwipe, start: SwipeStart, time: number): DialogSwipe => ({
  ...RESTING,
  closing: closes(swipe, start, time)
});

const nextSwipe = (swipe: DialogSwipe, event: SwipeEvent): DialogSwipe => {
  if (event.kind === 'toggled') {
    return RESTING;
  }
  if (event.kind === 'touched') {
    const { x, y, time, allowed } = event;
    return allowed ? { ...RESTING, start: { x, y, time } } : RESTING;
  }
  if (swipe.start === undefined) {
    return swipe;
  }
  return event.kind === 'moved' ? moved(swipe, swipe.start, event.x, event.y) : released(swipe, swipe.start, event.time);
};

const swipeOf = (events: Observable<SwipeEvent>): Observable<DialogSwipe> =>
  events.pipe(scan(nextSwipe, RESTING), startWith(RESTING), shareReplay(1));

const swipeClosed = (swipe: Observable<DialogSwipe>, delay: () => number): Observable<unknown> =>
  swipe.pipe(
    distinctUntilKeyChanged('closing'),
    filter(({ closing }) => closing),
    mergeMap(() => timer(delay()))
  );

const swipeOffset = ({ dy }: DialogSwipe): number => dy;

const backdropShare = ({ dy }: DialogSwipe): number => Math.max(FAINTEST_BACKDROP, 1 - dy / FADE_DISTANCE);

export { backdropShare, releasedAt, type SwipeEvent, swipeClosed, swipeOf, swipeOffset };

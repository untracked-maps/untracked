import { type Observable, scan, shareReplay, startWith } from 'rxjs';
import { closesAfter, dropOf, type Swipe, swipeOf } from '../../../../ui/components/swipe-down';

type Point = {
  readonly x: number;
  readonly y: number;
};

type StreetGesture = {
  readonly from: Point | undefined;
  readonly swipe: Swipe;
  readonly drop: number;
  readonly closing: boolean;
};

type StreetGestureEvent =
  | { readonly kind: 'touched'; readonly points: readonly Point[] }
  | { readonly kind: 'moved'; readonly points: readonly Point[] }
  | { readonly kind: 'released' }
  | { readonly kind: 'reset' };

const RESTING: StreetGesture = { from: undefined, swipe: 'undecided', drop: 0, closing: false };

const touched = (points: readonly Point[]): StreetGesture => {
  const [point] = points;
  return points.length === 1 ? { ...RESTING, from: point } : RESTING;
};

const moved = (gesture: StreetGesture, [point]: readonly Point[]): StreetGesture => {
  const { from, swipe } = gesture;
  if (from === undefined || point === undefined || swipe === 'scrolling') {
    return gesture;
  }
  const next = swipe === 'dropping' ? swipe : swipeOf(from, point);
  return { ...gesture, swipe: next, drop: next === 'dropping' ? dropOf(from, point) : 0 };
};

const released = ({ swipe, drop }: StreetGesture): StreetGesture => ({
  ...RESTING,
  closing: swipe === 'dropping' && closesAfter(drop)
});

const nextGesture = (gesture: StreetGesture, event: StreetGestureEvent): StreetGesture => {
  switch (event.kind) {
    case 'touched':
      return touched(event.points);
    case 'moved':
      return moved(gesture, event.points);
    case 'released':
      return released(gesture);
    default:
      return RESTING;
  }
};

const streetGesture = (events: Observable<StreetGestureEvent>): Observable<StreetGesture> =>
  events.pipe(scan(nextGesture, RESTING), startWith(RESTING), shareReplay(1));

export { type StreetGesture, type StreetGestureEvent, streetGesture };

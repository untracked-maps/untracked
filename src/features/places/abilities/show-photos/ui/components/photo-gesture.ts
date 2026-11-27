import { type Observable, scan, shareReplay, startWith } from 'rxjs';
import { closesAfter, dropOf, fadeAfter, swipeOf } from '../../../../ui/components/swipe-down';

type Point = {
  readonly x: number;
  readonly y: number;
};

type Size = {
  readonly width: number;
  readonly height: number;
};

type Hold =
  | { readonly kind: 'none' }
  | { readonly kind: 'undecided'; readonly from: Point }
  | { readonly kind: 'dropping'; readonly from: Point }
  | { readonly kind: 'scrolling' }
  | { readonly kind: 'pinching'; readonly distance: number; readonly scale: number }
  | { readonly kind: 'panning'; readonly from: Point; readonly pan: Point };

type PhotoGesture = {
  readonly hold: Hold;
  readonly scale: number;
  readonly pan: Point;
  readonly drop: number;
  readonly lastTouch: number | undefined;
  readonly closing: boolean;
  readonly size: Size;
};

type GestureEvent =
  | { readonly kind: 'touched'; readonly points: readonly Point[]; readonly time: number; readonly size: Size }
  | { readonly kind: 'moved'; readonly points: readonly Point[] }
  | { readonly kind: 'released'; readonly points: readonly Point[] }
  | { readonly kind: 'reset' };

const DOUBLE_TOUCH = 280;

const DOUBLE_TOUCH_ZOOM = 2.5;

const LARGEST_ZOOM = 5;

const ORIGIN: Point = { x: 0, y: 0 };

const NO_HOLD: Hold = { kind: 'none' };

const RESTING: PhotoGesture = {
  hold: NO_HOLD,
  scale: 1,
  pan: ORIGIN,
  drop: 0,
  lastTouch: undefined,
  closing: false,
  size: { width: 0, height: 0 }
};

const between = (value: number, lowest: number, highest: number): number => Math.min(highest, Math.max(lowest, value));

const distanceOf = ([first, second]: readonly Point[]): number =>
  first === undefined || second === undefined ? 0 : Math.hypot(second.x - first.x, second.y - first.y);

const panWithin = (pan: Point, scale: number, { width, height }: Size): Point => ({
  x: between(pan.x, ((1 - scale) * width) / 2, ((scale - 1) * width) / 2),
  y: between(pan.y, ((1 - scale) * height) / 2, ((scale - 1) * height) / 2)
});

const doubleTouched = (gesture: PhotoGesture): PhotoGesture => ({
  ...gesture,
  hold: NO_HOLD,
  scale: gesture.scale > 1 ? 1 : DOUBLE_TOUCH_ZOOM,
  pan: ORIGIN,
  lastTouch: undefined
});

const touched = (gesture: PhotoGesture, points: readonly Point[], time: number, size: Size): PhotoGesture => {
  const [point] = points;
  if (point === undefined) {
    return gesture;
  }
  if (points.length > 1) {
    return {
      ...gesture,
      size,
      drop: 0,
      lastTouch: undefined,
      hold: { kind: 'pinching', distance: distanceOf(points), scale: gesture.scale }
    };
  }
  if (gesture.lastTouch !== undefined && time - gesture.lastTouch < DOUBLE_TOUCH) {
    return doubleTouched({ ...gesture, size });
  }
  const hold: Hold =
    gesture.scale > 1 ? { kind: 'panning', from: point, pan: gesture.pan } : { kind: 'undecided', from: point };
  return { ...gesture, size, lastTouch: time, hold };
};

const decided = (gesture: PhotoGesture, from: Point, point: Point): PhotoGesture => {
  switch (swipeOf(from, point)) {
    case 'dropping':
      return { ...gesture, hold: { kind: 'dropping', from }, drop: dropOf(from, point) };
    case 'scrolling':
      return { ...gesture, hold: { kind: 'scrolling' } };
    default:
      return gesture;
  }
};

const pinched = (
  gesture: PhotoGesture,
  hold: { readonly distance: number; readonly scale: number },
  points: readonly Point[]
): PhotoGesture => {
  const distance = distanceOf(points);
  if (hold.distance === 0) {
    return gesture;
  }
  const scale = between((hold.scale * distance) / hold.distance, 1, LARGEST_ZOOM);
  return { ...gesture, scale, pan: panWithin(gesture.pan, scale, gesture.size) };
};

const moved = (gesture: PhotoGesture, points: readonly Point[]): PhotoGesture => {
  const { hold } = gesture;
  const [point] = points;
  if (point === undefined) {
    return gesture;
  }
  switch (hold.kind) {
    case 'undecided':
      return decided(gesture, hold.from, point);
    case 'dropping':
      return { ...gesture, drop: dropOf(hold.from, point) };
    case 'pinching':
      return pinched(gesture, hold, points);
    case 'panning':
      return {
        ...gesture,
        pan: panWithin(
          { x: hold.pan.x + point.x - hold.from.x, y: hold.pan.y + point.y - hold.from.y },
          gesture.scale,
          gesture.size
        )
      };
    default:
      return gesture;
  }
};

const released = (gesture: PhotoGesture, points: readonly Point[]): PhotoGesture => {
  const [point] = points;
  if (gesture.hold.kind === 'dropping') {
    return { ...gesture, hold: NO_HOLD, closing: closesAfter(gesture.drop), drop: 0 };
  }
  if (point !== undefined) {
    return { ...gesture, hold: { kind: 'panning', from: point, pan: gesture.pan } };
  }
  return { ...gesture, hold: NO_HOLD };
};

const nextGesture = (gesture: PhotoGesture, event: GestureEvent): PhotoGesture => {
  switch (event.kind) {
    case 'touched':
      return touched({ ...gesture, closing: false }, event.points, event.time, event.size);
    case 'moved':
      return moved(gesture, event.points);
    case 'released':
      return released(gesture, event.points);
    case 'reset':
      return { ...RESTING, size: gesture.size };
    default:
      return gesture;
  }
};

const photoGesture = (events: Observable<GestureEvent>): Observable<PhotoGesture> =>
  events.pipe(scan(nextGesture, RESTING), startWith(RESTING), shareReplay(1));

const fadeOf = ({ drop }: PhotoGesture): number => fadeAfter(drop);

const isZoomed = ({ scale }: PhotoGesture): boolean => scale > 1;

export { fadeOf, type GestureEvent, isZoomed, type PhotoGesture, photoGesture };

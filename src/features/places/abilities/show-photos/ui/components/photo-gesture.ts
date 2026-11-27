import { type Observable, scan, shareReplay, startWith } from 'rxjs';

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

const DECIDING_DISTANCE = 12;

const MORE_VERTICAL = 1.3;

const CLOSING_DROP = 110;

const FADE_DROP = 500;

const FAINTEST = 0.3;

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
  const dx = point.x - from.x;
  const dy = point.y - from.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= DECIDING_DISTANCE) {
    return gesture;
  }
  return dy > MORE_VERTICAL * Math.abs(dx)
    ? { ...gesture, hold: { kind: 'dropping', from }, drop: dy }
    : { ...gesture, hold: { kind: 'scrolling' } };
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
      return { ...gesture, drop: Math.max(0, point.y - hold.from.y) };
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
    return { ...gesture, hold: NO_HOLD, closing: gesture.drop > CLOSING_DROP, drop: 0 };
  }
  if (gesture.hold.kind === 'pinching' && point !== undefined) {
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
    default:
      return { ...RESTING, size: gesture.size };
  }
};

const photoGesture = (events: Observable<GestureEvent>): Observable<PhotoGesture> =>
  events.pipe(scan(nextGesture, RESTING), startWith(RESTING), shareReplay(1));

const fadeOf = ({ drop }: PhotoGesture): number => Math.max(FAINTEST, 1 - drop / FADE_DROP);

const isZoomed = ({ scale }: PhotoGesture): boolean => scale > 1;

export { fadeOf, type GestureEvent, isZoomed, type PhotoGesture, type Point, photoGesture };

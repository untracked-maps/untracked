import { delay, filter, type Observable, scan, shareReplay, startWith, take } from 'rxjs';
import { nearestStop, type SheetHeights, type SheetStop, settledStop, stopAbove, stopBelow } from './sheet-heights';

type SheetDrag = {
  readonly startX: number;
  readonly startY: number;
  readonly startTime: number;
  readonly startStop: SheetStop;
  readonly ratio: number;
  readonly scrolled: boolean;
  readonly follows: boolean | undefined;
  readonly dy: number;
};

type Sheet = {
  readonly stop: SheetStop;
  readonly heights: SheetHeights;
  readonly closing: boolean;
  readonly drag: SheetDrag | undefined;
};

type SheetEvent =
  | { readonly kind: 'measured'; readonly heights: SheetHeights }
  | { readonly kind: 'opened'; readonly stop: SheetStop }
  | {
      readonly kind: 'touched';
      readonly x: number;
      readonly y: number;
      readonly time: number;
      readonly sideways: boolean;
      readonly scrolled: boolean;
    }
  | { readonly kind: 'moved'; readonly x: number; readonly y: number }
  | { readonly kind: 'released'; readonly time: number; readonly closable: boolean }
  | { readonly kind: 'gripped' }
  | { readonly kind: 'wheeled' };

const UNMEASURED: SheetHeights = { peek: 0, half: 0, full: 0 };

const SLOP = 6;

const SIDEWAYS_RATIO = 2.5;

const FLICK = 0.45;

const CLOSING_FLICK = 0.5;

const CLOSING_SHARE = 0.7;

const LOWEST = 40;

const OVERSHOOT = 24;

const CLOSING_DELAY = 180;

const follows = (drag: SheetDrag, dx: number, dy: number): boolean => {
  const full = drag.startStop === 'full';
  return (full ? dy : Math.abs(dy)) > Math.abs(dx) * drag.ratio && !(full && drag.scrolled);
};

const moved = (drag: SheetDrag, x: number, y: number): SheetDrag => {
  const dx = x - drag.startX;
  const dy = y - drag.startY;
  if (drag.follows === undefined && Math.hypot(dx, dy) < SLOP) {
    return drag;
  }
  return { ...drag, dy, follows: drag.follows ?? follows(drag, dx, dy) };
};

const closes = ({ heights }: Sheet, drag: SheetDrag, speed: number): boolean =>
  heights[drag.startStop] - drag.dy < heights.peek * CLOSING_SHARE || (drag.startStop === 'peek' && speed > CLOSING_FLICK);

const settled = ({ heights }: Sheet, { startStop, dy }: SheetDrag, speed: number): SheetStop => {
  if (speed > FLICK) {
    return stopBelow(startStop, heights);
  }
  return speed < -FLICK ? stopAbove(startStop, heights) : nearestStop(heights[startStop] - dy, heights);
};

type Release = Extract<SheetEvent, { readonly kind: 'released' }>;

const released = (sheet: Sheet, drag: SheetDrag, { time, closable }: Release): Sheet => {
  const speed = drag.dy / (time - drag.startTime);
  return closable && closes(sheet, drag, speed)
    ? { ...sheet, drag: undefined, closing: true }
    : { ...sheet, drag: undefined, stop: settledStop(settled(sheet, drag, speed), sheet.heights) };
};

type GestureEvent = Extract<SheetEvent, { readonly kind: 'touched' | 'moved' | 'released' }>;

const dragged = (sheet: Sheet, event: GestureEvent): Sheet => {
  if (event.kind === 'touched') {
    const { x, y, time, sideways, scrolled } = event;
    const ratio = sideways ? SIDEWAYS_RATIO : 1;
    return {
      ...sheet,
      drag: { startX: x, startY: y, startTime: time, startStop: sheet.stop, ratio, scrolled, follows: undefined, dy: 0 }
    };
  }
  if (sheet.drag === undefined) {
    return sheet;
  }
  if (event.kind === 'moved') {
    return { ...sheet, drag: moved(sheet.drag, event.x, event.y) };
  }
  return sheet.drag.follows === true ? released(sheet, sheet.drag, event) : { ...sheet, drag: undefined };
};

const gripped = (sheet: Sheet): Sheet => ({
  ...sheet,
  stop: settledStop(sheet.stop === 'full' ? 'half' : 'full', sheet.heights)
});

const nextSheet = (sheet: Sheet, event: SheetEvent): Sheet => {
  if (event.kind === 'measured') {
    return { ...sheet, heights: event.heights, stop: settledStop(sheet.stop, event.heights) };
  }
  if (event.kind === 'opened') {
    return { ...sheet, stop: event.stop, drag: undefined };
  }
  if (event.kind === 'gripped') {
    return gripped(sheet);
  }
  return event.kind === 'wheeled' ? { ...sheet, stop: settledStop('full', sheet.heights) } : dragged(sheet, event);
};

const isDragged = ({ drag }: Sheet): boolean => drag?.follows === true;

const sheetHeight = ({ closing, drag, heights, stop }: Sheet): number => {
  if (closing) {
    return 0;
  }
  return drag?.follows === true
    ? Math.min(Math.max(heights[drag.startStop] - drag.dy, LOWEST), heights.full + OVERSHOOT)
    : heights[stop];
};

const UNOPENED: Sheet = { stop: 'half', heights: UNMEASURED, closing: false, drag: undefined };

const sheetOf = (event$: Observable<SheetEvent>): Observable<Sheet> =>
  event$.pipe(scan(nextSheet, UNOPENED), startWith(UNOPENED), shareReplay(1));

const sheetClosed = (sheet$: Observable<Sheet>): Observable<Sheet> =>
  sheet$.pipe(
    filter(({ closing }) => closing),
    take(1),
    delay(CLOSING_DELAY)
  );

type Finger = {
  readonly clientX: number;
  readonly clientY: number;
};

type Touched = {
  readonly time: number;
  readonly sideways: boolean;
  readonly scrolled: boolean;
};

type EventOf<Kind extends SheetEvent['kind']> = Extract<SheetEvent, { readonly kind: Kind }>;

const sheetMeasured = (heights: SheetHeights): EventOf<'measured'> => ({ kind: 'measured', heights });

const sheetOpened = (stop: SheetStop): EventOf<'opened'> => ({ kind: 'opened', stop });

const sheetTouched = ({ clientX, clientY }: Finger, touched: Touched): EventOf<'touched'> => ({
  kind: 'touched',
  x: clientX,
  y: clientY,
  ...touched
});

const sheetMoved = ({ clientX, clientY }: Finger): EventOf<'moved'> => ({ kind: 'moved', x: clientX, y: clientY });

const sheetReleased = (time: number, closable: boolean): EventOf<'released'> => ({ kind: 'released', time, closable });

const SHEET_GRIPPED: SheetEvent = { kind: 'gripped' };

const SHEET_WHEELED: SheetEvent = { kind: 'wheeled' };

export {
  isDragged,
  SHEET_GRIPPED,
  SHEET_WHEELED,
  type Sheet,
  type SheetEvent,
  sheetClosed,
  sheetHeight,
  sheetMeasured,
  sheetMoved,
  sheetOf,
  sheetOpened,
  sheetReleased,
  sheetTouched
};

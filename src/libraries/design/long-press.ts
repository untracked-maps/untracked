import { filter, fromEvent, map, merge, type Observable, switchMap, takeUntil, tap, timer } from 'rxjs';

type Vibrate = (milliseconds: number) => void;

type LongPress = {
  readonly onPress: () => void;
  readonly vibrate: Vibrate;
};

const PRESS_DURATION = 480;

const MOST_MOVE = 10;

const VIBRATION = 10;

const movedFrom =
  (start: PointerEvent) =>
  (move: PointerEvent): boolean =>
    Math.hypot(move.clientX - start.clientX, move.clientY - start.clientY) > MOST_MOVE;

const releasesOf = (element: HTMLElement, start: PointerEvent): Observable<unknown> =>
  merge(
    fromEvent(element, 'pointerup'),
    fromEvent(element, 'pointercancel'),
    fromEvent<PointerEvent>(element, 'pointermove').pipe(filter(movedFrom(start)))
  );

const heldFrom = (element: HTMLElement, start: PointerEvent, vibrate: Vibrate): Observable<PointerEvent> =>
  timer(PRESS_DURATION).pipe(
    takeUntil(releasesOf(element, start)),
    tap(() => vibrate(VIBRATION)),
    map(() => start)
  );

const longPress =
  ({ onPress, vibrate }: LongPress) =>
  (element: HTMLElement): (() => void) => {
    const subscription = fromEvent<PointerEvent>(element, 'pointerdown')
      .pipe(switchMap((start) => heldFrom(element, start, vibrate)))
      .subscribe(() => onPress());
    return (): void => subscription.unsubscribe();
  };

export { heldFrom, longPress, type Vibrate };

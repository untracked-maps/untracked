import { filter, fromEvent, map, merge, type Observable, switchMap, takeUntil, timer } from 'rxjs';

type LongPress = {
  readonly onPress: () => void;
  readonly vibrate: (milliseconds: number) => void;
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

const longPressesOf = (element: HTMLElement): Observable<void> =>
  fromEvent<PointerEvent>(element, 'pointerdown').pipe(
    switchMap((start) => timer(PRESS_DURATION).pipe(takeUntil(releasesOf(element, start)))),
    map(() => undefined)
  );

const longPress =
  ({ onPress, vibrate }: LongPress) =>
  (element: HTMLElement): (() => void) => {
    const subscription = longPressesOf(element).subscribe(() => {
      vibrate(VIBRATION);
      onPress();
    });
    return (): void => subscription.unsubscribe();
  };

export { longPress };

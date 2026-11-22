import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { EMPTY, fromEvent, map, merge, Observable, startWith, switchMap, take, tap } from 'rxjs';
import { heldFrom, type Vibrate } from '#libraries/design/long-press';
import { type Coordinates, type Press, type Touch, type TouchOutcome, touchTheMap } from '../../domain/touch-the-map';

type ScreenPoint = {
  readonly x: number;
  readonly y: number;
};

type PlaceAt = (map: MapLibreMap, point: ScreenPoint) => string | undefined;

type MapTouchPorts = {
  readonly placeAt: PlaceAt;
  readonly vibrate: Vibrate;
};

type MapTouchActions = MapTouchPorts & {
  readonly sheetOpen: Observable<boolean>;
  readonly onOpenPlace: (id: string) => void;
  readonly onInspect: (spot: Coordinates) => void;
  readonly onClose: () => void;
};

const mouseEvents =
  (target: MapLibreMap) =>
  (type: 'click' | 'contextmenu'): Observable<ScreenPoint> =>
    new Observable<ScreenPoint>((subscriber) => {
      const listener = ({ point }: MapMouseEvent): void => subscriber.next(point);
      target.on(type, listener);
      return (): void => {
        target.off(type, listener);
      };
    });

const pointOf = (target: MapLibreMap, { clientX, clientY }: PointerEvent): ScreenPoint => {
  const { left, top } = target.getCanvasContainer().getBoundingClientRect();
  return { x: clientX - left, y: clientY - top };
};

const touchAt =
  (target: MapLibreMap, placeAt: PlaceAt, press: Press) =>
  (point: ScreenPoint): Touch => {
    const { lng, lat } = target.unproject([point.x, point.y]).wrap();
    return { press, spot: { longitude: lng, latitude: lat }, place: placeAt(target, point) };
  };

const longPressesOf = (target: MapLibreMap, vibrate: Vibrate, down: PointerEvent | undefined): Observable<ScreenPoint> =>
  merge(
    down === undefined
      ? EMPTY
      : heldFrom(target.getCanvasContainer(), down, vibrate).pipe(map((start) => pointOf(target, start))),
    mouseEvents(target)('contextmenu')
  );

const firstOfGesture =
  (target: MapLibreMap, { placeAt, vibrate }: MapTouchPorts) =>
  (down: PointerEvent | undefined): Observable<Touch> =>
    merge(
      longPressesOf(target, vibrate, down).pipe(map(touchAt(target, placeAt, 'long press'))),
      mouseEvents(target)('click').pipe(map(touchAt(target, placeAt, 'touch')))
    ).pipe(take(1));

const touchesOf = (target: MapLibreMap, ports: MapTouchPorts): Observable<Touch> =>
  fromEvent<PointerEvent>(target.getCanvasContainer(), 'pointerdown').pipe(
    startWith(undefined),
    switchMap(firstOfGesture(target, ports))
  );

const followed =
  ({ onOpenPlace, onInspect, onClose }: MapTouchActions) =>
  (outcome: TouchOutcome): void => {
    switch (outcome.kind) {
      case 'open place':
        onOpenPlace(outcome.id);
        break;
      case 'inspect spot':
        onInspect(outcome.spot);
        break;
      default:
        onClose();
    }
  };

const touchedMapOverlay =
  (actions: MapTouchActions) =>
  (target: MapLibreMap): Observable<TouchOutcome> =>
    touchTheMap({ touched: touchesOf(target, actions), sheetOpen: actions.sheetOpen }).pipe(tap(followed(actions)));

export { touchedMapOverlay };

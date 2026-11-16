import { type LngLat, type Map as MapLibreMap, type MapMouseEvent, Marker } from 'maplibre-gl';
import { defer, filter, finalize, fromEvent, map, merge, Observable, pairwise, tap } from 'rxjs';
import { m } from '#i18n/messages';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';
import './inspected-spot-overlay.css';

type SpotActions = {
  readonly onInspect: (spot: Coordinates) => void;
  readonly onDismiss: () => void;
};

const coordinatesOf = (lngLat: LngLat): Coordinates => {
  const { lng, lat } = lngLat.wrap();
  return { longitude: lng, latitude: lat };
};

const pointerEvents =
  (target: MapLibreMap) =>
  (type: 'click' | 'contextmenu'): Observable<MapMouseEvent> =>
    new Observable<MapMouseEvent>((subscriber) => {
      const listener = (event: MapMouseEvent): void => subscriber.next(event);
      target.on(type, listener);
      return (): void => {
        target.off(type, listener);
      };
    });

const keysOn = (target: MapLibreMap, key: string): Observable<KeyboardEvent> =>
  fromEvent<KeyboardEvent>(target.getCanvas(), 'keydown').pipe(filter((event) => event.key === key));

const inspections = (target: MapLibreMap): Observable<Coordinates> =>
  merge(
    merge(pointerEvents(target)('click'), pointerEvents(target)('contextmenu')).pipe(map(({ lngLat }) => lngLat)),
    keysOn(target, 'Enter').pipe(map(() => target.getCenter()))
  ).pipe(map(coordinatesOf));

const spotMark = (): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'inspect-point-spot';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', m.inspect_point_spot());
  return element;
};

const isClosing = ([before, after]: readonly [InspectedSpot, InspectedSpot]): boolean =>
  before.kind !== 'none' && after.kind === 'none';

const markedSpots = (target: MapLibreMap, spot$: Observable<InspectedSpot>): Observable<InspectedSpot> =>
  defer(() => {
    const marker = new Marker({ element: spotMark(), anchor: 'bottom' });
    return spot$.pipe(
      tap((shown) =>
        shown.kind === 'none' ? marker.remove() : marker.setLngLat([shown.spot.longitude, shown.spot.latitude]).addTo(target)
      ),
      finalize(() => marker.remove())
    );
  });

const focusBack = (target: MapLibreMap, spot$: Observable<InspectedSpot>): Observable<unknown> =>
  spot$.pipe(
    pairwise(),
    filter(isClosing),
    tap(() => target.getCanvas().focus())
  );

const inspectedSpotOverlay =
  (spot$: Observable<InspectedSpot>, { onInspect, onDismiss }: SpotActions) =>
  (target: MapLibreMap): Observable<unknown> =>
    merge(
      inspections(target).pipe(tap(onInspect)),
      keysOn(target, 'Escape').pipe(tap(onDismiss)),
      markedSpots(target, spot$),
      focusBack(target, spot$)
    );

export { inspectedSpotOverlay };

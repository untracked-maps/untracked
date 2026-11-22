import { type LngLat, type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { defer, filter, finalize, fromEvent, map, merge, type Observable, pairwise, tap } from 'rxjs';
import { m } from '#i18n/messages';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';
import './inspected-spot-overlay.css';

type SpotActions = {
  readonly onInspect: (spot: Coordinates) => void;
};

const coordinatesOf = (lngLat: LngLat): Coordinates => {
  const { lng, lat } = lngLat.wrap();
  return { longitude: lng, latitude: lat };
};

const enterPresses = (target: MapLibreMap): Observable<KeyboardEvent> =>
  fromEvent<KeyboardEvent>(target.getCanvas(), 'keydown').pipe(filter((event) => event.key === 'Enter'));

const inspections = (target: MapLibreMap): Observable<Coordinates> =>
  enterPresses(target).pipe(map(() => coordinatesOf(target.getCenter())));

const spotMark = (): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'inspect-point-spot';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', m.inspect_point_spot());
  return element;
};

const isClosing = ([before, after]: readonly [InspectedSpot, InspectedSpot]): boolean =>
  before.kind !== 'none' && after.kind === 'none';

const isTypedIn = (): boolean => document.activeElement instanceof HTMLInputElement;

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
    filter(() => !isTypedIn()),
    tap(() => target.getCanvas().focus())
  );

const inspectedSpotOverlay =
  (spot$: Observable<InspectedSpot>, { onInspect }: SpotActions) =>
  (target: MapLibreMap): Observable<unknown> =>
    merge(inspections(target).pipe(tap(onInspect)), markedSpots(target, spot$), focusBack(target, spot$));

export { inspectedSpotOverlay };

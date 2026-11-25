import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { combineLatest, fromEvent, ignoreElements, merge, Observable, startWith, switchMap, tap } from 'rxjs';
import type { StationView } from '../../domain/show-station';
import type { Coordinates } from '../../domain/station-exits';
import { exitsData, STATION_EXITS_SOURCE, stationExitsLayers } from './station-exits-style';

const CLOSEST_ZOOM = 17;

const EASING = 600;

const hasStyle = (map: MapLibreMap): boolean => {
  const style: StyleSpecification | undefined = map.getStyle();
  return style !== undefined;
};

const layersOn = (map: MapLibreMap): Observable<MapLibreMap> =>
  new Observable<MapLibreMap>((subscriber) => {
    if (hasStyle(map)) {
      subscriber.next(
        stationExitsLayers.reduce(
          (drawn, layer) => drawn.addLayer(layer),
          map.addSource(STATION_EXITS_SOURCE, { type: 'geojson', data: exitsData({ status: 'none' }) })
        )
      );
    }
    return (): void => {
      stationExitsLayers.filter(({ id }) => map.getLayer(id) !== undefined).map(({ id }) => map.removeLayer(id));
      if (map.getSource(STATION_EXITS_SOURCE) !== undefined) {
        map.removeSource(STATION_EXITS_SOURCE);
      }
    };
  });

const easedTo =
  (map: MapLibreMap) =>
  ({ longitude, latitude }: Coordinates): void => {
    map.easeTo({ center: [longitude, latitude], zoom: Math.max(CLOSEST_ZOOM, map.getZoom()), duration: EASING });
  };

const drawStationExits = (
  map: MapLibreMap,
  station$: Observable<StationView>,
  touched$: Observable<Coordinates>
): Observable<never> =>
  merge(
    combineLatest([
      fromEvent(map, 'style.load').pipe(
        startWith(undefined),
        switchMap(() => layersOn(map))
      ),
      station$
    ]).pipe(tap(([drawn, view]) => drawn.getSource<GeoJSONSource>(STATION_EXITS_SOURCE)?.setData(exitsData(view)))),
    touched$.pipe(tap(easedTo(map)))
  ).pipe(ignoreElements());

export { drawStationExits };

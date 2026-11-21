import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { combineLatest, fromEvent, ignoreElements, map as mapEvent, Observable, startWith, switchMap, tap } from 'rxjs';
import type { PlaceDot } from '../../domain/show-places';
import { PLACE_DOTS_SOURCE, type PlaceNamesPalette, placeDotsData, placeDotsLayers } from './place-dots-style';

const hasStyle = (map: MapLibreMap): boolean => {
  const style: StyleSpecification | undefined = map.getStyle();
  return style !== undefined;
};

const added = (map: MapLibreMap, palette: PlaceNamesPalette): MapLibreMap =>
  placeDotsLayers(palette).reduce(
    (drawn, layer) => drawn.addLayer(layer),
    map.addSource(PLACE_DOTS_SOURCE, { type: 'geojson', data: placeDotsData([]) })
  );

const removed = (map: MapLibreMap, palette: PlaceNamesPalette): MapLibreMap =>
  placeDotsLayers(palette)
    .filter(({ id }) => map.getLayer(id) !== undefined)
    .reduce((cleared, { id }) => cleared.removeLayer(id), map);

const layersOn = (map: MapLibreMap, palette: PlaceNamesPalette): Observable<MapLibreMap> =>
  new Observable<MapLibreMap>((subscriber) => {
    if (hasStyle(map)) {
      subscriber.next(added(map, palette));
    }
    return (): void => {
      if (removed(map, palette).getSource(PLACE_DOTS_SOURCE) !== undefined) {
        map.removeSource(PLACE_DOTS_SOURCE);
      }
    };
  });

const zoomOf = (map: MapLibreMap): Observable<number> =>
  fromEvent(map, 'zoom').pipe(
    startWith(undefined),
    mapEvent(() => map.getZoom())
  );

const drawPlaceDots = (
  map: MapLibreMap,
  shownPlaces: (zoom$: Observable<number>) => Observable<readonly PlaceDot[]>,
  palette$: Observable<PlaceNamesPalette>
): Observable<never> =>
  combineLatest([
    combineLatest([fromEvent(map, 'style.load').pipe(startWith(undefined)), palette$]).pipe(
      switchMap(([, palette]) => layersOn(map, palette))
    ),
    shownPlaces(zoomOf(map))
  ]).pipe(
    tap(([drawn, dots]) => drawn.getSource<GeoJSONSource>(PLACE_DOTS_SOURCE)?.setData(placeDotsData(dots))),
    ignoreElements()
  );

export { drawPlaceDots };

import type { Map as MapLibreMap } from 'maplibre-gl';
import { from, type Observable, switchMap } from 'rxjs';
import type { PlaceDot } from '../../domain/show-places';
import type { PlaceNamesPalette } from './place-dots-style';

type ShownPlaces = (zoom$: Observable<number>) => Observable<readonly PlaceDot[]>;

const placeDotsOverlay =
  (shownPlaces: ShownPlaces, palette$: Observable<PlaceNamesPalette>) =>
  (map: MapLibreMap): Observable<never> =>
    from(import('./place-dots-on-map')).pipe(switchMap(({ drawPlaceDots }) => drawPlaceDots(map, shownPlaces, palette$)));

export { placeDotsOverlay };

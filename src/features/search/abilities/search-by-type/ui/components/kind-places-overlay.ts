import type { Map as MapLibreMap } from 'maplibre-gl';
import { EMPTY, from, type Observable, switchMap } from 'rxjs';
import type { KindSearch } from '../../domain/search-by-type';

const kindPlacesOverlay =
  (search$: Observable<KindSearch>) =>
  (map: MapLibreMap): Observable<never> =>
    search$.pipe(
      switchMap((search) =>
        search.status === 'found'
          ? from(import('./kind-places-pins')).pipe(switchMap(({ showPlaces }) => showPlaces(map)(search.places)))
          : EMPTY
      )
    );

export { kindPlacesOverlay };

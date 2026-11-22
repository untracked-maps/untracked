import { catchError, filter, map, type Observable, of, shareReplay, startWith, switchMap, take, withLatestFrom } from 'rxjs';
import type { Coordinates, LoadPlaces, Place, PlaceKind } from '../../../domain/place';
import { nearestOfKind } from './nearest-of-kind';

type SearchByTypePorts = {
  readonly loadPlaces: LoadPlaces;
};

type SearchByTypeInputs = {
  readonly chosen: Observable<PlaceKind | undefined>;
  readonly mapView: Observable<{ readonly center: Coordinates }>;
};

type KindSearch =
  | { readonly status: 'closed' }
  | { readonly status: 'searching'; readonly placeKind: PlaceKind }
  | { readonly status: 'found'; readonly placeKind: PlaceKind; readonly places: readonly [Place, ...Place[]] }
  | { readonly status: 'none-near'; readonly placeKind: PlaceKind }
  | { readonly status: 'unavailable'; readonly placeKind: PlaceKind };

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const CLOSED: KindSearch = { status: 'closed' };

const isNotEmpty = (places: readonly Place[]): places is readonly [Place, ...Place[]] => places.length > 0;

const resultOf = (placeKind: PlaceKind, places: readonly Place[]): KindSearch =>
  isNotEmpty(places) ? { status: 'found', placeKind, places } : { status: 'none-near', placeKind };

const searchOf = (loadPlaces: LoadPlaces, placeKind: PlaceKind, reference: Coordinates): Observable<KindSearch> =>
  loadPlaces().pipe(
    take(1),
    map((places) => resultOf(placeKind, nearestOfKind(places, placeKind, reference))),
    catchError(() => of<KindSearch>({ status: 'unavailable', placeKind })),
    startWith<KindSearch>({ status: 'searching', placeKind })
  );

const searchByType =
  ({ loadPlaces }: SearchByTypePorts) =>
  ({ chosen, mapView }: SearchByTypeInputs): Observable<KindSearch> =>
    chosen.pipe(
      withLatestFrom(
        mapView.pipe(
          map(({ center }) => center),
          startWith(CENTRE_OF_PARIS)
        )
      ),
      switchMap(([placeKind, reference]) =>
        placeKind === undefined ? of(CLOSED) : searchOf(loadPlaces, placeKind, reference)
      ),
      startWith(CLOSED),
      shareReplay({ bufferSize: 1, refCount: true })
    );

type FoundPlaces = Extract<KindSearch, { readonly status: 'found' }>;

const isFound = (search: KindSearch): search is FoundPlaces => search.status === 'found';

const placesFoundAt = (search$: Observable<KindSearch>): Observable<readonly [Coordinates, ...Coordinates[]]> =>
  search$.pipe(
    filter(isFound),
    map(({ places: [first, ...others] }) => [first.coordinates, ...others.map(({ coordinates }) => coordinates)] as const)
  );

export { type KindSearch, placesFoundAt, searchByType };

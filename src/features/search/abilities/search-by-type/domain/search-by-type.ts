import { catchError, filter, map, type Observable, of, shareReplay, startWith, switchMap, take, withLatestFrom } from 'rxjs';
import type { Coordinates, LoadPlaces, Place } from '../../../domain/place';
import type { CategoryKey } from './categories';
import { nearestOfCategory } from './nearest-of-category';

type SearchByTypePorts = {
  readonly loadPlaces: LoadPlaces;
};

type SearchByTypeInputs = {
  readonly chosen: Observable<CategoryKey | undefined>;
  readonly mapView: Observable<{ readonly center: Coordinates }>;
};

type KindSearch =
  | { readonly status: 'closed' }
  | { readonly status: 'searching'; readonly category: CategoryKey }
  | { readonly status: 'found'; readonly category: CategoryKey; readonly places: readonly [Place, ...Place[]] }
  | { readonly status: 'none-near'; readonly category: CategoryKey }
  | { readonly status: 'unavailable'; readonly category: CategoryKey };

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const CLOSED: KindSearch = { status: 'closed' };

const isNotEmpty = (places: readonly Place[]): places is readonly [Place, ...Place[]] => places.length > 0;

const resultOf = (category: CategoryKey, places: readonly Place[]): KindSearch =>
  isNotEmpty(places) ? { status: 'found', category, places } : { status: 'none-near', category };

const searchOf = (loadPlaces: LoadPlaces, category: CategoryKey, reference: Coordinates): Observable<KindSearch> =>
  loadPlaces().pipe(
    take(1),
    map((places) => resultOf(category, nearestOfCategory(places, category, reference))),
    catchError(() => of<KindSearch>({ status: 'unavailable', category })),
    startWith<KindSearch>({ status: 'searching', category })
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
      switchMap(([category, reference]) => (category === undefined ? of(CLOSED) : searchOf(loadPlaces, category, reference))),
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

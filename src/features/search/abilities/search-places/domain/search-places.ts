import {
  catchError,
  concat,
  distinctUntilChanged,
  ignoreElements,
  map,
  merge,
  type Observable,
  of,
  share,
  shareReplay,
  startWith,
  switchMap,
  take,
  timer,
  withLatestFrom
} from 'rxjs';
import type { Coordinates, LoadPlaces, Place } from '../../../domain/place';

type FindPlaces = (query: string, reference: Coordinates) => readonly Place[];

type IndexPlaces = (places: readonly Place[]) => Observable<FindPlaces>;

type SearchPlacesPorts = {
  readonly loadPlaces: LoadPlaces;
  readonly indexPlaces: IndexPlaces;
};

type SearchPlacesInputs = {
  readonly wake: Observable<void>;
  readonly query: Observable<string>;
  readonly mapView: Observable<{ readonly center: Coordinates }>;
};

type SearchState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'searching'; readonly query: string }
  | { readonly kind: 'found'; readonly query: string; readonly places: readonly Place[] }
  | { readonly kind: 'not-found'; readonly query: string }
  | { readonly kind: 'unavailable' };

type Index = { readonly kind: 'ready'; readonly findPlaces: FindPlaces } | { readonly kind: 'unavailable' };

const SHORTEST_QUERY = 2;

const TYPING_PAUSE = 250;

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const IDLE: SearchState = { kind: 'idle' };

const NO_INDEX: Index = { kind: 'unavailable' };

const UNAVAILABLE: SearchState = { kind: 'unavailable' };

const readyIndex = (findPlaces: FindPlaces): Index => ({ kind: 'ready', findPlaces });

const stateOf = (query: string, index: Index, reference: Coordinates): SearchState => {
  if (index.kind === 'unavailable') {
    return UNAVAILABLE;
  }
  const places = index.findPlaces(query, reference);
  return places.length > 0 ? { kind: 'found', query, places } : { kind: 'not-found', query };
};

const indexOnWake = ({ loadPlaces, indexPlaces }: SearchPlacesPorts, wake: Observable<void>): Observable<Index> =>
  wake.pipe(
    take(1),
    switchMap(() => loadPlaces().pipe(switchMap(indexPlaces), map(readyIndex))),
    catchError(() => of(NO_INDEX)),
    shareReplay(1)
  );

const referenceOf = (mapView: Observable<{ readonly center: Coordinates }>): Observable<Coordinates> =>
  mapView.pipe(
    map(({ center }) => center),
    startWith(CENTRE_OF_PARIS)
  );

const answerWith =
  (index$: Observable<Index>, reference$: Observable<Coordinates>) =>
  (typed: string): Observable<SearchState> =>
    concat(
      of<SearchState>({ kind: 'searching', query: typed }),
      timer(TYPING_PAUSE).pipe(
        switchMap(() => index$),
        take(1),
        withLatestFrom(reference$),
        map(([index, reference]) => stateOf(typed, index, reference))
      )
    );

const searchPlaces =
  (ports: SearchPlacesPorts) =>
  ({ wake, query, mapView }: SearchPlacesInputs): Observable<SearchState> => {
    const index$ = indexOnWake(ports, wake);
    const answerTo = answerWith(index$, referenceOf(mapView));
    const states$ = query.pipe(
      map((typed) => typed.trim()),
      distinctUntilChanged(),
      switchMap((typed) => (typed.length < SHORTEST_QUERY ? of(IDLE) : answerTo(typed))),
      startWith(IDLE)
    );
    return merge(index$.pipe(ignoreElements()), states$).pipe(share());
  };

export { type FindPlaces, type IndexPlaces, type SearchState, searchPlaces };

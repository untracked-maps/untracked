import {
  catchError,
  concat,
  concatMap,
  defer,
  EMPTY,
  ignoreElements,
  map,
  merge,
  type Observable,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
  take
} from 'rxjs';
import type { Place } from '../../../domain/place';

type RecentPlace = Pick<Place, 'id' | 'name' | 'kind' | 'address' | 'coordinates'>;

type RecentPlaces = readonly RecentPlace[];

type StoredRecents = () => Observable<RecentPlaces>;

type StoreRecents = (recents: RecentPlaces) => Observable<void>;

type RecentSearchesPorts = {
  readonly storedRecents: StoredRecents;
  readonly storeRecents: StoreRecents;
};

type RecentSearchesInputs = {
  readonly chosen: Observable<RecentPlace>;
  readonly cleared: Observable<void>;
};

type Change = (recents: RecentPlaces) => RecentPlaces;

const MOST_RECENT = 8;

const recentOf = ({ id, name, kind, address, coordinates: { longitude, latitude } }: RecentPlace): RecentPlace => ({
  id,
  name,
  kind,
  address,
  coordinates: { longitude, latitude }
});

const latest = (recents: RecentPlaces): RecentPlaces => recents.slice(0, MOST_RECENT);

const remember =
  (place: RecentPlace): Change =>
  (recents): RecentPlaces =>
    latest([recentOf(place), ...recents.filter(({ id }) => id !== place.id)]);

const forget: Change = () => [];

const storedWith =
  (storeRecents: StoreRecents) =>
  (recents: RecentPlaces): Observable<RecentPlaces> =>
    concat(
      storeRecents(recents).pipe(
        catchError(() => EMPTY),
        ignoreElements()
      ),
      of(recents)
    );

const changesOf = ({ chosen, cleared }: RecentSearchesInputs): Observable<Change> =>
  merge(chosen.pipe(map(remember)), cleared.pipe(map(() => forget)));

const recentSearches =
  ({ storedRecents, storeRecents }: RecentSearchesPorts) =>
  (inputs: RecentSearchesInputs): Observable<RecentPlaces> =>
    defer(storedRecents).pipe(
      take(1),
      map(latest),
      switchMap((stored) =>
        changesOf(inputs).pipe(
          scan((recents, change) => change(recents), stored),
          concatMap(storedWith(storeRecents)),
          startWith(stored)
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type RecentPlace, type RecentPlaces, recentSearches, type StoredRecents, type StoreRecents };

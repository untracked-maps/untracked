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
import type { Found } from '../../../domain/found';

type RecentPlace = Pick<Found, 'id' | 'name' | 'kind' | 'address' | 'coordinates'> & { readonly cuisine?: string };

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
  readonly restored: Observable<void>;
};

type Kept = {
  readonly recents: RecentPlaces;
  readonly cleared: RecentPlaces;
};

type Change = (kept: Kept) => Kept;

const MOST_RECENT = 8;

const recentOf = ({ id, name, kind, cuisine, address, coordinates: { longitude, latitude } }: RecentPlace): RecentPlace => ({
  id,
  name,
  kind,
  ...(cuisine === undefined ? {} : { cuisine }),
  address,
  coordinates: { longitude, latitude }
});

const latest = (recents: RecentPlaces): RecentPlaces => recents.slice(0, MOST_RECENT);

const remember =
  (place: RecentPlace): Change =>
  ({ recents, cleared }): Kept => ({
    recents: latest([recentOf(place), ...recents.filter(({ id }) => id !== place.id)]),
    cleared
  });

const forget: Change = ({ recents }) => ({ recents: [], cleared: recents });

const restore: Change = ({ recents, cleared }) => ({
  recents: latest([...recents, ...cleared.filter(({ id }) => recents.every((recent) => recent.id !== id))]),
  cleared: []
});

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

const keptFrom = (recents: RecentPlaces): Kept => ({ recents, cleared: [] });

const changesOf = ({ chosen, cleared, restored }: RecentSearchesInputs): Observable<Change> =>
  merge(chosen.pipe(map(remember)), cleared.pipe(map(() => forget)), restored.pipe(map(() => restore)));

const recentSearches =
  ({ storedRecents, storeRecents }: RecentSearchesPorts) =>
  (inputs: RecentSearchesInputs): Observable<RecentPlaces> =>
    defer(storedRecents).pipe(
      take(1),
      map(latest),
      switchMap((stored) =>
        changesOf(inputs).pipe(
          scan((kept, change) => change(kept), keptFrom(stored)),
          map(({ recents }) => recents),
          concatMap(storedWith(storeRecents)),
          startWith(stored)
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type RecentPlace, type RecentPlaces, recentSearches, type StoredRecents, type StoreRecents };

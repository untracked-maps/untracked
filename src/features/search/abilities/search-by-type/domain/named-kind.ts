import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  type Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  take
} from 'rxjs';
import type { PlaceKind } from '../../../domain/place';
import type { FindKind } from './kind-words';

type LoadKindFinder = () => Observable<FindKind>;

type NamedKindPorts = {
  readonly loadKindFinder: LoadKindFinder;
};

type NamedKindInputs = {
  readonly wake: Observable<void>;
  readonly query: Observable<string>;
};

const FINDS_NOTHING: FindKind = () => undefined;

const finderOnWake = (loadKindFinder: LoadKindFinder, wake: Observable<void>): Observable<FindKind> =>
  wake.pipe(
    take(1),
    switchMap(() => loadKindFinder().pipe(take(1))),
    catchError(() => of(FINDS_NOTHING)),
    startWith(FINDS_NOTHING)
  );

const namedKind =
  ({ loadKindFinder }: NamedKindPorts) =>
  ({ wake, query }: NamedKindInputs): Observable<PlaceKind | undefined> =>
    combineLatest([finderOnWake(loadKindFinder, wake), query]).pipe(
      map(([findKind, typed]) => findKind(typed)),
      startWith(undefined),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type LoadKindFinder, namedKind };

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
import type { CategoryKey } from './categories';
import type { FindCategory } from './category-words';

type LoadCategoryFinder = () => Observable<FindCategory>;

type NamedCategoryPorts = {
  readonly loadCategoryFinder: LoadCategoryFinder;
};

type NamedCategoryInputs = {
  readonly wake: Observable<void>;
  readonly query: Observable<string>;
};

const FINDS_NOTHING: FindCategory = () => undefined;

const finderOnWake = (loadCategoryFinder: LoadCategoryFinder, wake: Observable<void>): Observable<FindCategory> =>
  wake.pipe(
    take(1),
    switchMap(() => loadCategoryFinder().pipe(take(1))),
    catchError(() => of(FINDS_NOTHING)),
    startWith(FINDS_NOTHING)
  );

const namedCategory =
  ({ loadCategoryFinder }: NamedCategoryPorts) =>
  ({ wake, query }: NamedCategoryInputs): Observable<CategoryKey | undefined> =>
    combineLatest([finderOnWake(loadCategoryFinder, wake), query]).pipe(
      map(([findCategory, typed]) => findCategory(typed)),
      startWith(undefined),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type LoadCategoryFinder, namedCategory };

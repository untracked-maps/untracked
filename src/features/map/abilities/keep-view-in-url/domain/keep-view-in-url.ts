import {
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  merge,
  type Observable,
  of,
  share,
  withLatestFrom
} from 'rxjs';
import { fragmentOfView, type MapView, viewOfFragment } from './view-fragment';

type ReadFragment = () => Observable<string>;

type WriteFragment = (fragment: string) => Observable<string>;

type ViewInUrlPorts = {
  readonly readFragment: ReadFragment;
};

type KeepViewInUrlPorts = {
  readonly writeFragment: WriteFragment;
};

const SETTLING_TIME = 300;

const isView = (view: MapView | undefined): view is MapView => view !== undefined;

const viewInUrl =
  ({ readFragment }: ViewInUrlPorts) =>
  (): Observable<MapView> =>
    readFragment().pipe(map(viewOfFragment), filter(isView));

const unlessKept = ([, kept]: readonly [string, boolean]): boolean => !kept;

const settledFragments = (views$: Observable<MapView>): Observable<string> =>
  views$.pipe(debounceTime(SETTLING_TIME), map(fragmentOfView), distinctUntilChanged(), share());

const keepViewInUrl =
  ({ writeFragment }: KeepViewInUrlPorts) =>
  (
    views$: Observable<MapView>,
    steps$: Observable<unknown> = EMPTY,
    linkKept$: Observable<boolean> = of(false)
  ): Observable<string> => {
    const fragments$ = settledFragments(views$);
    return merge(
      combineLatest([fragments$, linkKept$]).pipe(
        filter(unlessKept),
        map(([fragment]) => fragment),
        distinctUntilChanged()
      ),
      steps$.pipe(
        withLatestFrom(fragments$, linkKept$),
        map(([, fragment, kept]): readonly [string, boolean] => [fragment, kept]),
        filter(unlessKept),
        map(([fragment]) => fragment)
      )
    ).pipe(concatMap(writeFragment));
  };

export { keepViewInUrl, type ReadFragment, type ViewInUrlPorts, viewInUrl, type WriteFragment };

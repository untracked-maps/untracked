import { concatMap, debounceTime, distinctUntilChanged, filter, map, type Observable } from 'rxjs';
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

const keepViewInUrl =
  ({ writeFragment }: KeepViewInUrlPorts) =>
  (views$: Observable<MapView>): Observable<string> =>
    views$.pipe(debounceTime(SETTLING_TIME), map(fragmentOfView), distinctUntilChanged(), concatMap(writeFragment));

export { keepViewInUrl, type ReadFragment, viewInUrl, type WriteFragment };

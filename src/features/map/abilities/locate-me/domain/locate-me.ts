import { map, type Observable, share, startWith, switchMap } from 'rxjs';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type MapView = {
  readonly center: Coordinates;
  readonly zoom: number;
};

type Located = {
  readonly kind: 'located';
  readonly position: Coordinates;
};

type LocateFailure = { readonly kind: 'permission-denied' } | { readonly kind: 'position-unavailable' };

type LocateResult = Located | LocateFailure;

type Locate = () => Observable<LocateResult>;

type LocateMePorts = {
  readonly locate: Locate;
};

type LocateMeStatus = { readonly kind: 'locating' } | { readonly kind: 'located'; readonly view: MapView } | LocateFailure;

const STREET_LEVEL = 16;

const LOCATING: LocateMeStatus = { kind: 'locating' };

const statusOf = (result: LocateResult): LocateMeStatus =>
  result.kind === 'located' ? { kind: 'located', view: { center: result.position, zoom: STREET_LEVEL } } : result;

const locateMe =
  ({ locate }: LocateMePorts) =>
  (request$: Observable<void>): Observable<LocateMeStatus> =>
    request$.pipe(
      switchMap(() => locate().pipe(map(statusOf), startWith(LOCATING))),
      share()
    );

export { type Locate, type Located, type LocateMeStatus, type LocateResult, locateMe };

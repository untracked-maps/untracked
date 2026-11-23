import {
  catchError,
  concatMap,
  defer,
  distinctUntilChanged,
  endWith,
  filter,
  ignoreElements,
  map,
  merge,
  type Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  take
} from 'rxjs';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type SheetPlace = {
  readonly id: string;
  readonly name: string;
  readonly kind?: string;
  readonly cuisine?: string;
  readonly family?: string;
  readonly address?: PostalAddress;
  readonly phone?: string;
  readonly website?: string;
  readonly menu?: string;
  readonly instagram?: string;
  readonly facebook?: string;
  readonly coordinates: Coordinates;
};

type PostalAddress = {
  readonly houseNumber?: string;
  readonly street?: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
};

type Origin = 'search' | 'kind list' | 'map';

type Opening = {
  readonly id: string;
  readonly from: Origin;
};

type PlaceSheet =
  | { readonly status: 'closed' }
  | { readonly status: 'open'; readonly place: SheetPlace; readonly from: Origin };

type LoadPlaces = () => Observable<readonly SheetPlace[]>;

type OpenPlacePorts = {
  readonly loadPlaces: LoadPlaces;
};

type OpenPlaceInputs = {
  readonly opened: Observable<Opening>;
  readonly closed: Observable<unknown>;
};

type Copied = 'copied' | 'not copied';

type CopyText = (text: string) => Observable<unknown>;

type CopyAddressPorts = {
  readonly copyText: CopyText;
};

const CLOSED: PlaceSheet = { status: 'closed' };

const openedPlaceOf = (sheet: PlaceSheet): SheetPlace | undefined => (sheet.status === 'open' ? sheet.place : undefined);

const isOpened = (place: SheetPlace | undefined): place is SheetPlace => place !== undefined;

const placesOpenedAt = (sheet$: Observable<PlaceSheet>): Observable<Coordinates> =>
  sheet$.pipe(
    map(openedPlaceOf),
    distinctUntilChanged(),
    filter(isOpened),
    map(({ coordinates }) => coordinates)
  );

const sheetOf =
  ({ id, from }: Opening) =>
  (places: readonly SheetPlace[]): PlaceSheet => {
    const place = places.find((known) => known.id === id);
    return place === undefined ? CLOSED : { status: 'open', place, from };
  };

const openPlace = ({ loadPlaces }: OpenPlacePorts): ((inputs: OpenPlaceInputs) => Observable<PlaceSheet>) => {
  const places$ = defer(loadPlaces).pipe(
    take(1),
    catchError(() => of<readonly SheetPlace[]>([])),
    shareReplay(1)
  );
  return ({ opened, closed }: OpenPlaceInputs): Observable<PlaceSheet> =>
    merge(opened.pipe(map((opening) => places$.pipe(map(sheetOf(opening))))), closed.pipe(map(() => of(CLOSED)))).pipe(
      switchMap((sheet) => sheet),
      startWith(CLOSED),
      shareReplay({ bufferSize: 1, refCount: true })
    );
};

const copied =
  ({ copyText }: CopyAddressPorts) =>
  (text: string): Observable<Copied> =>
    copyText(text).pipe(
      ignoreElements(),
      endWith<Copied>('copied'),
      catchError(() => of<Copied>('not copied'))
    );

const copyAddress =
  (ports: CopyAddressPorts) =>
  (copies: Observable<string>): Observable<Copied> =>
    copies.pipe(concatMap(copied(ports)));

export {
  type CopyText,
  copyAddress,
  type LoadPlaces,
  type Opening,
  openedPlaceOf,
  openPlace,
  type PlaceSheet,
  type PostalAddress,
  placesOpenedAt,
  type SheetPlace
};

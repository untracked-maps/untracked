import {
  catchError,
  defer,
  distinctUntilChanged,
  filter,
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

type District = {
  readonly name: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly coordinates: Coordinates;
};

type Outline = readonly Coordinates[];

type KnownOutline = {
  readonly name: string;
  readonly postalCode: string;
  readonly outline: Outline;
};

type LoadOutlines = () => Observable<readonly KnownOutline[]>;

type DistrictSheet =
  | { readonly status: 'closed' }
  | { readonly status: 'open'; readonly district: District; readonly outline: Outline };

type FramedDistrict = {
  readonly at: Coordinates;
  readonly outline: Outline;
};

type OpenDistrictPorts = {
  readonly loadOutlines: LoadOutlines;
};

type OpenDistrictInputs = {
  readonly opened: Observable<District>;
  readonly closed: Observable<unknown>;
};

const CLOSED: DistrictSheet = { status: 'closed' };

const NO_OUTLINE: Outline = [];

const outlineOf =
  ({ name, postalCode }: District) =>
  (known: readonly KnownOutline[]): Outline =>
    known.find((outline) => outline.name === name && outline.postalCode === postalCode)?.outline ?? NO_OUTLINE;

const sheetOf =
  (outlines$: Observable<readonly KnownOutline[]>) =>
  (district: District | undefined): Observable<DistrictSheet> =>
    district === undefined
      ? of(CLOSED)
      : outlines$.pipe(
          map(outlineOf(district)),
          catchError(() => of(NO_OUTLINE)),
          map((outline): DistrictSheet => ({ status: 'open', district, outline }))
        );

const openDistrict =
  ({ loadOutlines }: OpenDistrictPorts) =>
  ({ opened, closed }: OpenDistrictInputs): Observable<DistrictSheet> => {
    const outlines$ = defer(loadOutlines).pipe(take(1), shareReplay(1));
    return merge(opened, closed.pipe(map(() => undefined))).pipe(
      switchMap(sheetOf(outlines$)),
      startWith(CLOSED),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  };

type OpenSheet = Extract<DistrictSheet, { readonly status: 'open' }>;

const openSheetOf = (sheet: DistrictSheet): OpenSheet | undefined => (sheet.status === 'open' ? sheet : undefined);

const isOpen = (sheet: OpenSheet | undefined): sheet is OpenSheet => sheet !== undefined;

const sameDistrict = (before: OpenSheet | undefined, after: OpenSheet | undefined): boolean =>
  before?.district === after?.district;

const districtsFramedAt = (sheet$: Observable<DistrictSheet>): Observable<FramedDistrict> =>
  sheet$.pipe(
    map(openSheetOf),
    distinctUntilChanged(sameDistrict),
    filter(isOpen),
    map(({ district, outline }) => ({ at: district.coordinates, outline }))
  );

const outlinedOf = (sheet: DistrictSheet): Outline | undefined =>
  sheet.status === 'open' && sheet.outline.length > 0 ? sheet.outline : undefined;

const districtsOutlined = (sheet$: Observable<DistrictSheet>): Observable<Outline | undefined> =>
  sheet$.pipe(map(outlinedOf), distinctUntilChanged());

export {
  type District,
  type DistrictSheet,
  districtsFramedAt,
  districtsOutlined,
  type FramedDistrict,
  type KnownOutline,
  type LoadOutlines,
  openDistrict
};

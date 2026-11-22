import { catchError, combineLatest, defer, distinctUntilChanged, map, type Observable, of } from 'rxjs';

const FAMILIES = [
  'food',
  'cafe',
  'bar',
  'bakery',
  'culture',
  'sight',
  'health',
  'stay',
  'nature',
  'shop',
  'money',
  'fuel',
  'train'
] as const;

type Family = (typeof FAMILIES)[number];

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type Place = {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly family: Family | undefined;
  readonly coordinates: Coordinates;
  readonly minzoom: number;
  readonly rank: number;
};

type PlaceDot = {
  readonly id: string;
  readonly name: string;
  readonly family: Family | undefined;
  readonly coordinates: Coordinates;
  readonly order: number;
};

type LoadPlaces = () => Observable<readonly Place[]>;

type ShowPlacesPorts = {
  readonly loadPlaces: LoadPlaces;
};

type Shown = {
  readonly from: number;
  readonly order: number;
};

const ZOOM_STEP = 0.25;

const CLOSE_ZOOM: number = 17;

const CLOSER_ZOOM: number = 17.5;

const LAST_PRIORITY_AT_CLOSE_ZOOM = 2.5;

const WITHOUT_FAMILY: Shown = { from: 18, order: 5 };

const NEVER_SHOWN_WITHOUT_FAMILY = 'school';

const PRIORITIES: Readonly<Record<Family, number | undefined>> = {
  food: 0,
  cafe: 0,
  bar: 0.5,
  bakery: 0.5,
  culture: 1,
  sight: 1,
  health: 2,
  stay: 2.5,
  nature: 3,
  shop: 4,
  money: 4.5,
  fuel: 4.5,
  train: undefined
};

const STATION_PRIORITY = 0;

const zoomOfFamily = (priority: number): number => (priority <= LAST_PRIORITY_AT_CLOSE_ZOOM ? CLOSE_ZOOM : CLOSER_ZOOM);

const shownWithFamily = (minzoom: number, priority: number | undefined): Shown =>
  priority === undefined
    ? { from: minzoom, order: STATION_PRIORITY }
    : { from: Math.min(minzoom, zoomOfFamily(priority)), order: priority };

const shownWithoutFamily = (kind: string): Shown | undefined =>
  kind === NEVER_SHOWN_WITHOUT_FAMILY ? undefined : WITHOUT_FAMILY;

const shownFromAfar = ({ family, minzoom, rank }: Place): Shown | undefined =>
  family === undefined ? undefined : { from: minzoom, order: rank };

const shownUpClose = ({ family, kind, minzoom }: Place): Shown | undefined =>
  family === undefined ? shownWithoutFamily(kind) : shownWithFamily(minzoom, PRIORITIES[family]);

const dotsAt =
  (zoom: number) =>
  (places: readonly Place[]): readonly PlaceDot[] =>
    places.flatMap((place): PlaceDot[] => {
      const shown = zoom < CLOSE_ZOOM ? shownFromAfar(place) : shownUpClose(place);
      return shown !== undefined && shown.from <= zoom
        ? [{ id: place.id, name: place.name, family: place.family, coordinates: place.coordinates, order: shown.order }]
        : [];
    });

const stepOf = (zoom: number): number => Math.floor(zoom / ZOOM_STEP) * ZOOM_STEP;

const showPlaces =
  ({ loadPlaces }: ShowPlacesPorts) =>
  (zoom$: Observable<number>, open$: Observable<string | undefined>): Observable<readonly PlaceDot[]> =>
    combineLatest([
      defer(loadPlaces).pipe(catchError(() => of<readonly Place[]>([]))),
      zoom$.pipe(map(stepOf), distinctUntilChanged()),
      open$
    ]).pipe(map(([places, zoom, open]) => dotsAt(zoom)(places.filter(({ id }) => id !== open))));

export { FAMILIES, type Family, type LoadPlaces, type Place, type PlaceDot, showPlaces };

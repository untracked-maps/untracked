import { catchError, distinctUntilChanged, map, type Observable, of, startWith, switchMap } from 'rxjs';

type Tags = Readonly<Partial<Record<string, string>>>;

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type StreetViewPlace = {
  readonly id: string;
  readonly name: string;
  readonly coordinates: Coordinates;
  readonly tags?: Tags;
};

type Picture = {
  readonly image: string;
  readonly camera: Coordinates;
  readonly azimuth: number;
};

type LoadPicture = (id: string) => Observable<Picture>;

type StreetView =
  | { readonly status: 'none' }
  | { readonly status: 'shown'; readonly name: string; readonly image: string; readonly facing: number };

type ShowStreetViewPorts = {
  readonly loadPicture: LoadPicture;
};

type ShowStreetViewInputs = {
  readonly opened: Observable<StreetViewPlace | undefined>;
};

type Asked = {
  readonly id: string;
  readonly name: string;
  readonly picture: string;
  readonly place: Coordinates;
};

const NONE: StreetView = { status: 'none' };

const PICTURE_ID = /^[a-z0-9-]+$/u;

const SITE_PATH = /^(?:[a-z0-9-]+\/)+[a-z0-9-]+\.[a-z0-9]+$/u;

const DEGREES_PER_HALF_TURN = 180;

const DEGREES_PER_TURN = 360;

const HALF = 0.5;

const radians = (angle: number): number => (angle * Math.PI) / DEGREES_PER_HALF_TURN;

const degrees = (angle: number): number => (angle * DEGREES_PER_HALF_TURN) / Math.PI;

const bearingFrom = (from: Coordinates, to: Coordinates): number => {
  const along = radians(to.longitude - from.longitude);
  const [start, end] = [radians(from.latitude), radians(to.latitude)];
  return degrees(
    Math.atan2(
      Math.sin(along) * Math.cos(end),
      Math.cos(start) * Math.sin(end) - Math.sin(start) * Math.cos(end) * Math.cos(along)
    )
  );
};

const relative = (angle: number): number =>
  (((angle % DEGREES_PER_TURN) + DEGREES_PER_TURN + DEGREES_PER_HALF_TURN) % DEGREES_PER_TURN) - DEGREES_PER_HALF_TURN;

const turnFraction = (angle: number): number => HALF + relative(angle) / DEGREES_PER_TURN;

const facingOf = ({ camera, azimuth }: Picture, place: Coordinates): number =>
  turnFraction(bearingFrom(camera, place) - azimuth);

const askedOf = (place: StreetViewPlace | undefined): Asked | undefined => {
  const picture = place?.tags?.['panoramax'];
  return place === undefined || picture === undefined || !PICTURE_ID.test(picture)
    ? undefined
    : { id: place.id, name: place.name, picture, place: place.coordinates };
};

const sameAsked = (previous: Asked | undefined, next: Asked | undefined): boolean =>
  previous?.id === next?.id && previous?.picture === next?.picture;

const viewOf = (picture: Picture, { name, place }: Asked): StreetView =>
  SITE_PATH.test(picture.image) ? { status: 'shown', name, image: picture.image, facing: facingOf(picture, place) } : NONE;

const shownFor =
  (loadPicture: LoadPicture) =>
  (asked: Asked | undefined): Observable<StreetView> =>
    asked === undefined
      ? of(NONE)
      : loadPicture(asked.picture).pipe(
          map((picture) => viewOf(picture, asked)),
          catchError(() => of(NONE)),
          startWith(NONE)
        );

const showStreetView =
  ({ loadPicture }: ShowStreetViewPorts) =>
  ({ opened }: ShowStreetViewInputs): Observable<StreetView> =>
    opened.pipe(
      map(askedOf),
      distinctUntilChanged(sameAsked),
      switchMap(shownFor(loadPicture)),
      startWith(NONE),
      distinctUntilChanged()
    );

export { type LoadPicture, type Picture, type StreetView, showStreetView };

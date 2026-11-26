import { combineLatest, distinctUntilChanged, map, type Observable, shareReplay, startWith } from 'rxjs';
import { type Freshness, freshnessOf, type Tags } from './freshness';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type GlancePlace = {
  readonly id: string;
  readonly coordinates: Coordinates;
  readonly tags?: Tags;
};

type Access = 'yes' | 'limited' | 'no';

type GlanceColumn =
  | { readonly kind: 'hours' }
  | { readonly kind: 'distance'; readonly metres: number }
  | { readonly kind: 'wheelchair'; readonly access: Access }
  | { readonly kind: 'entrance'; readonly fee: 'free' | 'paid' };

type Glance = {
  readonly columns: readonly GlanceColumn[];
  readonly freshness?: Freshness;
};

type GlanceAtPlaceInputs = {
  readonly opened: Observable<GlancePlace | undefined>;
  readonly position: Observable<Coordinates | undefined>;
  readonly hoursShown: Observable<boolean>;
  readonly time: Observable<number>;
};

const EARTH_RADIUS_IN_METRES = 6_371_008.8;

const DEGREES_PER_HALF_TURN = 180;

const NOTHING: Glance = { columns: [] };

const isAccess = (value: string | undefined): value is Access => value === 'yes' || value === 'limited' || value === 'no';

const radians = (degrees: number): number => (degrees * Math.PI) / DEGREES_PER_HALF_TURN;

const metresBetween = (from: Coordinates, to: Coordinates): number => {
  const half =
    Math.sin(radians(to.latitude - from.latitude) / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(radians(to.longitude - from.longitude) / 2) ** 2;
  return 2 * EARTH_RADIUS_IN_METRES * Math.asin(Math.sqrt(half));
};

const hoursColumn = (shown: boolean): readonly GlanceColumn[] => (shown ? [{ kind: 'hours' }] : []);

const distanceColumn = (place: GlancePlace, position: Coordinates | undefined): readonly GlanceColumn[] =>
  position === undefined ? [] : [{ kind: 'distance', metres: metresBetween(position, place.coordinates) }];

const wheelchairColumn = (tags: Tags): readonly GlanceColumn[] => {
  const access = tags['wheelchair'];
  return isAccess(access) ? [{ kind: 'wheelchair', access }] : [];
};

const entranceColumn = (tags: Tags): readonly GlanceColumn[] => {
  switch (tags['fee']) {
    case 'yes':
      return [{ kind: 'entrance', fee: 'paid' }];
    case 'no':
      return [{ kind: 'entrance', fee: 'free' }];
    default:
      return [];
  }
};

const glanceOf = ([place, position, hoursShown, now]: readonly [
  GlancePlace | undefined,
  Coordinates | undefined,
  boolean,
  number
]): Glance => {
  if (place === undefined) {
    return NOTHING;
  }
  const tags = place.tags ?? {};
  const columns = [
    ...hoursColumn(hoursShown),
    ...distanceColumn(place, position),
    ...wheelchairColumn(tags),
    ...entranceColumn(tags)
  ];
  const freshness = freshnessOf(tags, now);
  return freshness === undefined ? { columns } : { columns, freshness };
};

const sameGlance = (previous: Glance, next: Glance): boolean => JSON.stringify(previous) === JSON.stringify(next);

const glanceAtPlace = ({ opened, position, hoursShown, time }: GlanceAtPlaceInputs): Observable<Glance> =>
  combineLatest([opened, position, hoursShown, time]).pipe(
    map(glanceOf),
    startWith(NOTHING),
    distinctUntilChanged(sameGlance),
    shareReplay({ bufferSize: 1, refCount: true })
  );

export { type Access, type Glance, type GlanceColumn, type GlancePlace, glanceAtPlace };

import type { FakePlace } from './fake-place';

type FakeFamily =
  | 'bakery'
  | 'bar'
  | 'cafe'
  | 'culture'
  | 'food'
  | 'fuel'
  | 'health'
  | 'money'
  | 'nature'
  | 'shop'
  | 'sight'
  | 'stay'
  | 'train';

type FakePlaceOnMap = FakePlace & {
  readonly family?: FakeFamily;
  readonly minzoom: number;
  readonly rank: number;
};

const FAMILIES: Readonly<Record<FakePlace['kind'], FakeFamily | undefined>> = {
  restaurant: 'food',
  cafe: 'cafe',
  bar: 'bar',
  bakery: 'bakery',
  pharmacy: 'health',
  supermarket: 'shop',
  hairdresser: 'shop',
  'beauty-salon': 'shop',
  florist: 'shop',
  bookshop: 'shop',
  hotel: 'stay',
  school: undefined,
  parking: undefined,
  park: 'nature',
  museum: 'culture',
  cinema: 'culture',
  library: 'culture',
  'post-office': undefined,
  hospital: 'health',
  theatre: 'culture',
  attraction: 'sight',
  'department-store': 'shop',
  garden: 'nature',
  monument: 'sight',
  'place-of-worship': 'sight',
  station: 'train',
  'fast-food': 'food',
  'ice-cream': 'food',
  chocolate: 'food',
  deli: 'food',
  nightclub: 'bar',
  marketplace: 'shop',
  greengrocer: 'shop',
  cheese: 'shop',
  butcher: 'shop',
  wine: 'shop',
  clothes: 'shop',
  newsagent: 'shop',
  diy: 'shop',
  'mobile-phone': 'shop',
  toys: 'shop',
  stationery: 'shop',
  music: 'shop',
  atm: 'money',
  bank: 'money',
  optician: 'shop',
  laundry: undefined,
  townhall: undefined,
  police: undefined,
  coworking: undefined,
  doctor: 'health',
  veterinary: 'health',
  'pet-shop': 'shop',
  'escape-game': 'culture',
  playground: 'nature',
  'fitness-centre': undefined,
  'swimming-pool': undefined,
  cemetery: 'nature',
  bicycle: undefined,
  fuel: 'fuel',
  'charging-station': 'fuel',
  toilets: undefined,
  'drinking-water': undefined
};

const MONUMENT_FAMILIES: ReadonlySet<FakeFamily | undefined> = new Set(['culture', 'nature', 'sight', 'train']);

const MOST_FAME = 99;

const ZOOM_STEP = 0.25;

const LATEST_ZOOM = 16.5;

const EARLIEST_ZOOM = { monument: 11.5, other: 13.75 };

const RANKS_OF_MONUMENTS = 100;

const stepsBefore = (earliest: number): number => (LATEST_ZOOM - earliest) / ZOOM_STEP;

const minzoomOf = (earliest: number, fame: number): number =>
  LATEST_ZOOM - Math.round((fame / MOST_FAME) * stepsBefore(earliest)) * ZOOM_STEP;

const shownOnMap = (isMonument: boolean, fame: number): Pick<FakePlaceOnMap, 'minzoom' | 'rank'> =>
  isMonument
    ? { minzoom: minzoomOf(EARLIEST_ZOOM.monument, fame), rank: MOST_FAME - fame }
    : { minzoom: minzoomOf(EARLIEST_ZOOM.other, fame), rank: RANKS_OF_MONUMENTS + MOST_FAME - fame };

const familyOf = (kind: FakePlace['kind']): FakeFamily | undefined => FAMILIES[kind];

const onMap = (place: FakePlace): FakePlaceOnMap => {
  const family = familyOf(place.kind);
  return {
    ...place,
    ...(family === undefined ? {} : { family }),
    ...shownOnMap(MONUMENT_FAMILIES.has(family), place.fame)
  };
};

export { type FakeFamily, type FakePlaceOnMap, familyOf, onMap };

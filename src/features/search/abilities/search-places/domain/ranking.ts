import type { Coordinates, Place, PlaceKind } from '../../../domain/place';
import { normalised, significantWordCountOf } from './words';

type Candidate = {
  readonly place: Place;
  readonly qualities: readonly number[];
};

type Ranked = {
  readonly place: Place;
  readonly score: number;
  readonly strong: boolean;
};

const KIND_BONUSES: Readonly<Partial<Record<PlaceKind, number>>> = {
  attraction: 8,
  cinema: 3,
  'department-store': 4,
  garden: 3,
  hospital: 4,
  monument: 6,
  museum: 8,
  park: 6,
  parking: -12,
  'place-of-worship': 4,
  station: 10,
  theatre: 4
};

const KINDS_FAME_DOES_NOT_EXCUSE: ReadonlySet<PlaceKind> = new Set<PlaceKind>([
  'bakery',
  'bar',
  'beauty-salon',
  'bookshop',
  'cafe',
  'department-store',
  'florist',
  'hairdresser',
  'pharmacy',
  'restaurant',
  'supermarket'
]);

const PERCENT = 100;

const WHOLE_NAME = 0.15;

const NAME_START = 0.08;

const SURE_TEXT = 0.6;

const COVERED_TEXT = 0.4;

const FAME_WEIGHT = 0.6;

const FULL_EXCUSE_FAME = 70;

const NEAR_PENALTY_PER_KILOMETRE = 3;

const NEAR_PENALTY_LIMIT = 25;

const FAR_PENALTY_PER_KILOMETRE = 0.04;

const FAR_PENALTY_LIMIT = 20;

const METRES_PER_DEGREE_OF_LONGITUDE_AT_THE_EQUATOR = 111_320;

const METRES_PER_DEGREE_OF_LATITUDE = 110_540;

const METRES_PER_KILOMETRE = 1000;

const HALF_TURN_IN_DEGREES = 180;

const STRONG_TEXT = 0.7;

const STRONG_COVER = 0.5;

const kilometresBetween = (from: Coordinates, to: Coordinates): number =>
  Math.hypot(
    (to.longitude - from.longitude) *
      METRES_PER_DEGREE_OF_LONGITUDE_AT_THE_EQUATOR *
      Math.cos((from.latitude * Math.PI) / HALF_TURN_IN_DEGREES),
    (to.latitude - from.latitude) * METRES_PER_DEGREE_OF_LATITUDE
  ) / METRES_PER_KILOMETRE;

const textOf = (qualities: readonly number[]): number =>
  qualities.reduce((sum, quality) => sum + quality, 0) / qualities.length;

const coverOf = (qualities: readonly number[], place: Place): number =>
  Math.min(1, qualities.length / significantWordCountOf(place.name));

const startOf = (query: string, place: Place): number => {
  const name = normalised(place.name);
  const typed = normalised(query);
  return name === typed ? WHOLE_NAME : Number(name.startsWith(typed)) * NAME_START;
};

const excuseOf = ({ kind, fame }: Place): number =>
  KINDS_FAME_DOES_NOT_EXCUSE.has(kind) ? 0 : Math.min(1, fame / FULL_EXCUSE_FAME);

const distancePenaltyOf = (place: Place, reference: Coordinates): number => {
  const kilometres = kilometresBetween(reference, place.coordinates);
  return (
    (Math.min(NEAR_PENALTY_LIMIT, kilometres * NEAR_PENALTY_PER_KILOMETRE) +
      Math.min(FAR_PENALTY_LIMIT, kilometres * FAR_PENALTY_PER_KILOMETRE)) *
    (1 - excuseOf(place))
  );
};

const rankedOf =
  (query: string, reference: Coordinates) =>
  ({ place, qualities }: Candidate): Ranked => {
    const text = textOf(qualities);
    const cover = coverOf(qualities, place);
    return {
      place,
      score:
        PERCENT * text * (SURE_TEXT + COVERED_TEXT * cover) +
        PERCENT * startOf(query, place) +
        FAME_WEIGHT * place.fame +
        (KIND_BONUSES[place.kind] ?? 0) -
        distancePenaltyOf(place, reference),
      strong: text >= STRONG_TEXT && cover >= STRONG_COVER
    };
  };

const strongFirst = (left: Ranked, right: Ranked): number =>
  Number(right.strong) - Number(left.strong) || right.score - left.score;

export { type Candidate, rankedOf, strongFirst };

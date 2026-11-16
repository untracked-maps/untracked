import type { Coordinates } from './place';

const METRES_PER_DEGREE_OF_LONGITUDE_AT_THE_EQUATOR = 111_320;

const METRES_PER_DEGREE_OF_LATITUDE = 110_540;

const METRES_PER_KILOMETRE = 1000;

const HALF_TURN_IN_DEGREES = 180;

const kilometresBetween = (from: Coordinates, to: Coordinates): number =>
  Math.hypot(
    (to.longitude - from.longitude) *
      METRES_PER_DEGREE_OF_LONGITUDE_AT_THE_EQUATOR *
      Math.cos((from.latitude * Math.PI) / HALF_TURN_IN_DEGREES),
    (to.latitude - from.latitude) * METRES_PER_DEGREE_OF_LATITUDE
  ) / METRES_PER_KILOMETRE;

export { kilometresBetween };

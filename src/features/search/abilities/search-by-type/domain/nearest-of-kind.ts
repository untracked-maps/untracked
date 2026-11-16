import { kilometresBetween } from '../../../domain/distance';
import type { Coordinates, Place, PlaceKind } from '../../../domain/place';

type Distant = {
  readonly place: Place;
  readonly kilometres: number;
};

const RADIUS_KILOMETRES = 3.5;

const MOST_PLACES = 25;

const distantFrom =
  (reference: Coordinates) =>
  (place: Place): Distant => ({ place, kilometres: kilometresBetween(reference, place.coordinates) });

const isWithinRadius = ({ kilometres }: Distant): boolean => kilometres <= RADIUS_KILOMETRES;

const nearestFirst = (left: Distant, right: Distant): number => left.kilometres - right.kilometres;

const nearestOfKind = (places: readonly Place[], placeKind: PlaceKind, reference: Coordinates): readonly Place[] =>
  places
    .filter(({ kind }) => kind === placeKind)
    .map(distantFrom(reference))
    .filter(isWithinRadius)
    .toSorted(nearestFirst)
    .slice(0, MOST_PLACES)
    .map(({ place }) => place);

export { nearestOfKind };

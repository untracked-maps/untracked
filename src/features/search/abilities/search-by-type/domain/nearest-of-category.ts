import { kilometresBetween } from '../../../domain/distance';
import type { Coordinates, Place } from '../../../domain/place';
import { type CategoryKey, kindsOf } from './categories';

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

const nearestOfCategory = (places: readonly Place[], category: CategoryKey, reference: Coordinates): readonly Place[] =>
  places
    .filter(({ kind }) => kindsOf(category).includes(kind))
    .map(distantFrom(reference))
    .filter(isWithinRadius)
    .toSorted(nearestFirst)
    .slice(0, MOST_PLACES)
    .map(({ place }) => place);

export { nearestOfCategory };

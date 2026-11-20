import type { FakePlace } from './fake-place';
import type { FakeZone } from './fake-zone';
import { generatedPlaces } from './generated-places';

const GENERATED_PLACES = 2000;

const fakePlaces = (zone: FakeZone): readonly FakePlace[] => [...zone.landmarks, ...generatedPlaces(zone, GENERATED_PLACES)];

export { fakePlaces };

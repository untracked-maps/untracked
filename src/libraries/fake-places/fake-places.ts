import type { FakeZone } from './fake-zone';
import { addedPlaces, generatedPlaces } from './generated-places';
import { type FakePlaceOnMap, onMap } from './place-on-map';

const GENERATED_PLACES = 2000;

const fakePlaces = (zone: FakeZone): readonly FakePlaceOnMap[] =>
  [...zone.landmarks, ...generatedPlaces(zone, GENERATED_PLACES), ...addedPlaces(zone, GENERATED_PLACES)].map(onMap);

export { fakePlaces };

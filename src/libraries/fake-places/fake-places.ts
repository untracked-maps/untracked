import { type FakePicture, fakeStreetViews } from './fake-street-views';
import type { FakeZone } from './fake-zone';
import { addedPlaces, generatedPlaces } from './generated-places';
import { type FakePlaceOnMap, onMap } from './place-on-map';

const GENERATED_PLACES = 2000;

const streetViewsOf = (zone: FakeZone): ReturnType<typeof fakeStreetViews> =>
  fakeStreetViews(zone.landmarks, [...generatedPlaces(zone, GENERATED_PLACES), ...addedPlaces(zone, GENERATED_PLACES)]);

const fakePlaces = (zone: FakeZone): readonly FakePlaceOnMap[] => streetViewsOf(zone).places.map(onMap);

const fakePictures = (zone: FakeZone): readonly FakePicture[] => streetViewsOf(zone).pictures;

export { fakePictures, fakePlaces };

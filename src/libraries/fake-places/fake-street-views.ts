import { base, Faker } from '@faker-js/faker';
import { photoFile, SHADES } from './fake-photos';
import type { FakePlace } from './fake-place';
import { familyOf } from './place-on-map';

type FakeCoordinates = FakePlace['coordinates'];

type FakePicture = {
  readonly id: string;
  readonly image: string;
  readonly camera: FakeCoordinates;
  readonly azimuth: number;
};

type FakeStreetViews = {
  readonly places: readonly FakePlace[];
  readonly pictures: readonly FakePicture[];
};

type Viewed = {
  readonly place: FakePlace;
  readonly picture?: FakePicture;
};

const SEED = 2003;

const SHARE_WITH_STREET_VIEW = 0.33;

const NEAREST_METRES = 4;

const FARTHEST_METRES = 18;

const METRES_PER_DEGREE = 111_320;

const DEGREES_PER_HALF_TURN = 180;

const DEGREES_PER_TURN = 360;

const LAST_BEARING = 359;

const CAMERA_DECIMALS = 6;

const STREET_VIEW_BOX = { west: 2.224, south: 48.815, east: 2.47, north: 48.902 };

const WITHOUT_STREET_VIEW: ReadonlySet<FakePlace['kind']> = new Set([
  'parking',
  'atm',
  'charging-station',
  'toilets',
  'drinking-water',
  'cemetery',
  'monument',
  'station'
]);

const inBox = ({ longitude, latitude }: FakeCoordinates): boolean =>
  longitude >= STREET_VIEW_BOX.west &&
  longitude <= STREET_VIEW_BOX.east &&
  latitude >= STREET_VIEW_BOX.south &&
  latitude <= STREET_VIEW_BOX.north;

const mayHaveStreetView = (place: FakePlace): boolean => !WITHOUT_STREET_VIEW.has(place.kind) && inBox(place.coordinates);

const radians = (degrees: number): number => (degrees * Math.PI) / DEGREES_PER_HALF_TURN;

const rounded = (value: number): number => Number(value.toFixed(CAMERA_DECIMALS));

const cameraOf = (faker: Faker, place: FakePlace): FakePicture => {
  const metres = faker.number.float({ min: NEAREST_METRES, max: FARTHEST_METRES });
  const from = faker.number.int({ min: 0, max: LAST_BEARING });
  const { longitude, latitude } = place.coordinates;
  return {
    id: place.id,
    image: `street-views/${photoFile(familyOf(place.kind) ?? 'none', faker.number.int({ min: 1, max: SHADES }))}`,
    camera: {
      longitude: rounded(longitude + (metres * Math.sin(radians(from))) / (METRES_PER_DEGREE * Math.cos(radians(latitude)))),
      latitude: rounded(latitude + (metres * Math.cos(radians(from))) / METRES_PER_DEGREE)
    },
    azimuth: (from + DEGREES_PER_HALF_TURN) % DEGREES_PER_TURN
  };
};

const viewed = (faker: Faker, place: FakePlace): Viewed => {
  const picture = cameraOf(faker, place);
  return { place: { ...place, tags: { ...place.tags, panoramax: picture.id } }, picture };
};

const drawn =
  (faker: Faker) =>
  (place: FakePlace): Viewed =>
    mayHaveStreetView(place) && faker.datatype.boolean({ probability: SHARE_WITH_STREET_VIEW })
      ? viewed(faker, place)
      : { place };

const chosen =
  (faker: Faker) =>
  (place: FakePlace): Viewed =>
    place.tags?.['panoramax'] === undefined ? { place } : viewed(faker, place);

const gathered = (views: readonly Viewed[]): FakeStreetViews => ({
  places: views.map(({ place }) => place),
  pictures: views.flatMap(({ picture }) => (picture === undefined ? [] : [picture]))
});

const fakeStreetViews = (landmarks: readonly FakePlace[], others: readonly FakePlace[]): FakeStreetViews => {
  const faker = new Faker({ locale: [base], seed: SEED });
  return gathered([...landmarks.map(chosen(faker)), ...others.map(drawn(faker))]);
};

const streetViewByHand = (id: string): Readonly<Record<string, string>> => ({ panoramax: id });

export { type FakePicture, fakeStreetViews, streetViewByHand };

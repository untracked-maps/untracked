import { base, Faker, fr } from '@faker-js/faker';
import type { FakePlace, GeneratedKind } from './fake-place';
import { placeNameOf } from './place-names';

const SEED = 1789;

const PARIS = { west: 2.22, south: 48.81, east: 2.47, north: 48.91 } as const;

const PRECISION = 5;

const ARRONDISSEMENTS = 20;

const FAMOUS_SHARE = 0.05;

const MOST_FAME = 30;

const HIGHEST_NUMBER = 150;

const ID_DIGITS = 4;

const KIND_WEIGHTS: readonly { readonly weight: number; readonly value: GeneratedKind }[] = [
  { weight: 18, value: 'restaurant' },
  { weight: 12, value: 'cafe' },
  { weight: 8, value: 'bar' },
  { weight: 8, value: 'bakery' },
  { weight: 6, value: 'pharmacy' },
  { weight: 6, value: 'supermarket' },
  { weight: 6, value: 'hairdresser' },
  { weight: 4, value: 'beauty-salon' },
  { weight: 4, value: 'florist' },
  { weight: 4, value: 'bookshop' },
  { weight: 5, value: 'hotel' },
  { weight: 4, value: 'school' },
  { weight: 3, value: 'parking' },
  { weight: 3, value: 'park' },
  { weight: 2, value: 'museum' },
  { weight: 2, value: 'cinema' },
  { weight: 2, value: 'library' },
  { weight: 2, value: 'post-office' },
  { weight: 1, value: 'hospital' },
  { weight: 2, value: 'theatre' }
];

const idOf = (index: number): string => `fake-paris-${String(index + 1).padStart(ID_DIGITS, '0')}`;

const postcodeOf = (faker: Faker): string =>
  `750${String(faker.number.int({ min: 1, max: ARRONDISSEMENTS })).padStart(2, '0')}`;

const addressOf = (faker: Faker): string =>
  `${faker.number.int({ min: 1, max: HIGHEST_NUMBER })} ${faker.location.street()}, ${postcodeOf(faker)} Paris`;

const fameOf = (faker: Faker): number =>
  faker.datatype.boolean({ probability: FAMOUS_SHARE }) ? faker.number.int({ min: 1, max: MOST_FAME }) : 0;

const generatedPlace =
  (faker: Faker) =>
  (index: number): FakePlace => {
    const kind = faker.helpers.weightedArrayElement(KIND_WEIGHTS);
    return {
      id: idOf(index),
      name: placeNameOf(kind, { firstName: faker.person.firstName(), lastName: faker.person.lastName() }),
      kind,
      address: addressOf(faker),
      coordinates: {
        longitude: faker.location.longitude({ min: PARIS.west, max: PARIS.east, precision: PRECISION }),
        latitude: faker.location.latitude({ min: PARIS.south, max: PARIS.north, precision: PRECISION })
      },
      fame: fameOf(faker)
    };
  };

const generatedPlaces = (count: number): readonly FakePlace[] => {
  const faker = new Faker({ locale: [fr, base], seed: SEED });
  return Array.from({ length: count }, (_, index) => generatedPlace(faker)(index));
};

export { generatedPlaces };

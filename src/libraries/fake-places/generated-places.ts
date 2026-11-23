import { Faker } from '@faker-js/faker';
import type { FakePlace, FakePostalAddress, GeneratedKind } from './fake-place';
import { fakeReach } from './fake-reach';
import { fakeTags } from './fake-tags';
import type { FakeZone } from './fake-zone';
import { placeNameOf } from './place-names';

const SEED = 1789;

const CUISINE_SEED = 1848;

const REACH_SEED = 1871;

const TAGS_SEED = 1905;

const PRECISION = 5;

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

const CUISINE_WEIGHTS: readonly { readonly weight: number; readonly value: string | undefined }[] = [
  { weight: 30, value: 'french' },
  { weight: 15, value: 'italian' },
  { weight: 10, value: 'japanese' },
  { weight: 8, value: 'chinese' },
  { weight: 6, value: 'lebanese' },
  { weight: 6, value: 'indian' },
  { weight: 5, value: 'vietnamese' },
  { weight: 4, value: 'thai' },
  { weight: 3, value: 'greek' },
  { weight: 3, value: 'mexican' },
  { weight: 10, value: undefined }
];

type Fakers = {
  readonly faker: Faker;
  readonly cuisines: Faker;
  readonly reach: Faker;
  readonly tags: Faker;
};

const idOf = (zone: FakeZone, index: number): string => `${zone.id}-${String(index + 1).padStart(ID_DIGITS, '0')}`;

const addressOf = (faker: Faker, zone: FakeZone): FakePostalAddress => ({
  houseNumber: String(faker.number.int({ min: 1, max: HIGHEST_NUMBER })),
  street: faker.location.street(),
  postalCode: faker.helpers.arrayElement(zone.postcodes),
  addressLocality: zone.city,
  addressCountry: zone.country
});

const cuisineOf = (faker: Faker, kind: GeneratedKind): Pick<FakePlace, 'cuisine'> => {
  const cuisine = kind === 'restaurant' ? faker.helpers.weightedArrayElement(CUISINE_WEIGHTS) : undefined;
  return cuisine === undefined ? {} : { cuisine };
};

const fameOf = (faker: Faker): number =>
  faker.datatype.boolean({ probability: FAMOUS_SHARE }) ? faker.number.int({ min: 1, max: MOST_FAME }) : 0;

const generatedPlace =
  ({ faker, cuisines, reach, tags }: Fakers, zone: FakeZone) =>
  (index: number): FakePlace => {
    const kind = faker.helpers.weightedArrayElement(KIND_WEIGHTS);
    const name = placeNameOf(kind, { firstName: faker.person.firstName(), lastName: faker.person.lastName() });
    return {
      id: idOf(zone, index),
      name,
      kind,
      ...cuisineOf(cuisines, kind),
      address: addressOf(faker, zone),
      ...fakeReach(reach, { name, kind }),
      ...fakeTags(tags, { kind }),
      coordinates: {
        longitude: faker.location.longitude({ min: zone.bounds.west, max: zone.bounds.east, precision: PRECISION }),
        latitude: faker.location.latitude({ min: zone.bounds.south, max: zone.bounds.north, precision: PRECISION })
      },
      fame: fameOf(faker)
    };
  };

const generatedPlaces = (zone: FakeZone, count: number): readonly FakePlace[] => {
  const fakers: Fakers = {
    faker: new Faker({ locale: [...zone.locale], seed: SEED }),
    cuisines: new Faker({ locale: [...zone.locale], seed: CUISINE_SEED }),
    reach: new Faker({ locale: [...zone.locale], seed: REACH_SEED }),
    tags: new Faker({ locale: [...zone.locale], seed: TAGS_SEED })
  };
  return Array.from({ length: count }, (_, index) => generatedPlace(fakers, zone)(index));
};

export { generatedPlaces };

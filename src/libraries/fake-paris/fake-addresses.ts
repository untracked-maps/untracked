import { addressPartsOf } from './address-parts';
import ARRONDISSEMENTS_FILE from './arrondissements.json' with { type: 'json' };
import { fakeParis } from './fake-paris';
import type { FakePlace } from './fake-place';

type FakeCoordinates = FakePlace['coordinates'];

type FakeStreetAddress = {
  readonly kind: 'address' | 'street';
  readonly address: string;
  readonly number?: string;
  readonly street: string;
  readonly postcode: string;
  readonly city: string;
  readonly coordinates: FakeCoordinates;
};

type FakeDistrict = {
  readonly kind: 'district';
  readonly name: string;
  readonly postcode: string;
  readonly city: string;
  readonly coordinates: FakeCoordinates;
};

type FakeAddress = FakeStreetAddress | FakeDistrict;

const CITY = 'Paris';

const streetAddressOf = ({ address, coordinates }: FakePlace): readonly FakeStreetAddress[] =>
  addressPartsOf(address).map(
    ({ number, street, postcode, city }): FakeStreetAddress =>
      number === undefined
        ? { kind: 'street', address, street, postcode, city, coordinates }
        : { kind: 'address', address, number, street, postcode, city, coordinates }
  );

const districtOf = ({ name, postcode, coordinates }: (typeof ARRONDISSEMENTS_FILE)[number]): FakeDistrict => ({
  kind: 'district',
  name,
  postcode,
  city: CITY,
  coordinates
});

const fakeAddresses = (): readonly FakeAddress[] => [
  ...fakeParis().flatMap(streetAddressOf),
  ...ARRONDISSEMENTS_FILE.map(districtOf)
];

export { fakeAddresses };

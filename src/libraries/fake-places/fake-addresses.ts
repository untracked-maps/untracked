import { addressPartsOf } from './address-parts';
import type { FakePlace } from './fake-place';
import { fakePlaces } from './fake-places';
import type { FakeDistrictOfZone, FakeZone } from './fake-zone';

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

const streetAddressOf = ({ address, coordinates }: FakePlace): readonly FakeStreetAddress[] =>
  addressPartsOf(address).map(
    ({ number, street, postcode, city }): FakeStreetAddress =>
      number === undefined
        ? { kind: 'street', address, street, postcode, city, coordinates }
        : { kind: 'address', address, number, street, postcode, city, coordinates }
  );

const districtOf =
  (city: string) =>
  ({ name, postcode, coordinates }: FakeDistrictOfZone): FakeDistrict => ({
    kind: 'district',
    name,
    postcode,
    city,
    coordinates
  });

const fakeAddresses = (zone: FakeZone): readonly FakeAddress[] => [
  ...fakePlaces(zone).flatMap(streetAddressOf),
  ...zone.districts.map(districtOf(zone.city))
];

export { fakeAddresses };

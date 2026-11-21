import type { FakePlace, FakePostalAddress } from './fake-place';
import { fakePlaces } from './fake-places';
import type { FakeDistrictOfZone, FakeZone } from './fake-zone';

type FakeCoordinates = FakePlace['coordinates'];

type FakeLocality = Pick<FakePostalAddress, 'postalCode' | 'addressLocality' | 'addressCountry'>;

type FakeStreetAddress = FakeLocality & {
  readonly kind: 'address' | 'street';
  readonly address: string;
  readonly houseNumber?: string;
  readonly street: string;
  readonly coordinates: FakeCoordinates;
};

type FakeDistrict = FakeLocality & {
  readonly kind: 'district';
  readonly name: string;
  readonly coordinates: FakeCoordinates;
};

type FakeAddress = FakeStreetAddress | FakeDistrict;

const lineOf = ({ houseNumber, street, postalCode, addressLocality }: FakePostalAddress): string =>
  [[houseNumber, street].filter((part) => part !== undefined).join(' '), `${postalCode} ${addressLocality}`].join(', ');

const streetAddressOf = ({ address, coordinates }: FakePlace): readonly FakeStreetAddress[] => {
  const { houseNumber, street, postalCode, addressLocality, addressCountry } = address;
  const located = { address: lineOf(address), street, postalCode, addressLocality, addressCountry, coordinates };
  return [houseNumber === undefined ? { kind: 'street', ...located } : { kind: 'address', houseNumber, ...located }];
};

const districtOf =
  ({ city, country }: FakeZone) =>
  ({ name, postcode, coordinates }: FakeDistrictOfZone): FakeDistrict => ({
    kind: 'district',
    name,
    postalCode: postcode,
    addressLocality: city,
    addressCountry: country,
    coordinates
  });

const fakeAddresses = (zone: FakeZone): readonly FakeAddress[] => [
  ...fakePlaces(zone).flatMap(streetAddressOf),
  ...zone.districts.map(districtOf(zone))
];

export { fakeAddresses };

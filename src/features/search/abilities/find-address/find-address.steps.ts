import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, of } from 'rxjs';
import type { Found } from '../../domain/found';
import type { Coordinates, Place } from '../../domain/place';
import { findAddress, type LoadAddresses } from './domain/find-address';
import { lazyAddressBook } from './implementation/lazy/lazy-address-book';
import { prerenderedAddressBook } from './implementation/prerendered/prerendered-address-book';

type AddressFile = readonly Readonly<Record<string, unknown>>[];

type FindAddressWorld = World & {
  file?: AddressFile;
  loadAddresses: LoadAddresses;
  reference?: Coordinates;
  places?: readonly Place[];
  found: readonly Found[];
};

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const ADDRESSES_FILE = '/data/addresses.json';

const SERVED = 200;

const FAILED = 500;

const placeNamed = (name: string): Place => ({
  id: name,
  name,
  kind: 'cafe',
  address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
  coordinates: CENTRE_OF_PARIS,
  fame: 0
});

const namesOf = (found: readonly Found[]): readonly string[] => found.map(({ name }) => name);

const CITY = 'Paris';

const locatedIn = (row: Readonly<Partial<Record<string, string>>>): Readonly<Record<string, unknown>> => ({
  postalCode: row['postcode'],
  addressLocality: CITY,
  addressCountry: 'FR',
  coordinates: { longitude: Number(row['longitude']), latitude: Number(row['latitude']) }
});

const houseIn = (row: Readonly<Partial<Record<string, string>>>): Readonly<Record<string, unknown>> => ({
  kind: 'address',
  houseNumber: row['number'],
  street: row['street'],
  ...locatedIn(row)
});

const districtIn = (row: Readonly<Partial<Record<string, string>>>): Readonly<Record<string, unknown>> => ({
  kind: 'district',
  name: row['name'],
  ...locatedIn(row)
});

const served = (world: FindAddressWorld, file: AddressFile, status: number): void => {
  world.file = file;
  world.loadAddresses = prerenderedAddressBook(() => Promise.resolve(Response.json(file, { status })), ADDRESSES_FILE);
};

Given('these houses in the address book', function theseHouses(this: FindAddressWorld, table: DataTable) {
  served(this, [...(this.file ?? []), ...table.hashes().map(houseIn)], SERVED);
});

Given('these districts in the address book', function theseDistricts(this: FindAddressWorld, table: DataTable) {
  served(this, [...(this.file ?? []), ...table.hashes().map(districtIn)], SERVED);
});

Given('the address book cannot be loaded', function theAddressBookCannotBeLoaded(this: FindAddressWorld) {
  served(this, [], FAILED);
});

Given(
  'the visitor looks for an address around longitude {float} and latitude {float}',
  function theVisitorLooksAround(this: FindAddressWorld, longitude: number, latitude: number) {
    this.reference = { longitude, latitude };
  }
);

Given('the places {string} found by name', function thePlacesFoundByName(this: FindAddressWorld, names: string) {
  this.places = names.split(', ').map(placeNamed);
});

When('the visitor looks up {string}', async function theVisitorLooksUp(this: FindAddressWorld, query: string) {
  const findFound = await firstValueFrom(
    findAddress({ loadAddresses: this.loadAddresses, indexAddresses: lazyAddressBook })(of(() => this.places ?? []))
  );
  this.found = findFound(query, this.reference ?? CENTRE_OF_PARIS);
});

Then('the first result is {string}', function theFirstResultIs(this: FindAddressWorld, line: string) {
  const [first] = this.found;
  assert.equal(
    first === undefined ? undefined : `${first.name}, ${first.address.postalCode} ${first.address.addressLocality}`,
    line
  );
});

Then('no place is among the results', function noPlaceIsAmongTheResults(this: FindAddressWorld) {
  assert.deepEqual(
    this.found.filter(({ kind }) => kind === 'cafe'),
    []
  );
});

Then('the results start with {string}', function theResultsStartWith(this: FindAddressWorld, names: string) {
  const expected = names.split(', ');
  assert.deepEqual(namesOf(this.found).slice(0, expected.length), expected);
});

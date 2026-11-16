import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, of } from 'rxjs';
import { fakeAddresses } from '#libraries/fake-paris/fake-addresses';
import type { Found } from '../../domain/found';
import type { Coordinates, Place } from '../../domain/place';
import { findAddress, type LoadAddresses } from './domain/find-address';
import { lazyAddressBook } from './implementation/lazy/lazy-address-book';
import { prerenderedAddressBook } from './implementation/prerendered/prerendered-address-book';

type FindAddressWorld = World & {
  loadAddresses: LoadAddresses;
  reference: Coordinates;
  places: readonly Place[];
  found: readonly Found[];
};

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const ADDRESSES_FILE = '/data/addresses.json';

const SERVED = 200;

const FAILED = 500;

const servingAddresses = (status: number) => (): Promise<Response> =>
  Promise.resolve(Response.json(fakeAddresses(), { status }));

const placeNamed = (name: string): Place => ({
  id: name,
  name,
  kind: 'cafe',
  address: '',
  coordinates: CENTRE_OF_PARIS,
  fame: 0
});

const namesOf = (found: readonly Found[]): readonly string[] => found.map(({ name }) => name);

const theAddressBook = (world: FindAddressWorld, status: number, reference: Coordinates): void => {
  world.loadAddresses = prerenderedAddressBook(servingAddresses(status), ADDRESSES_FILE);
  world.reference = reference;
  world.places = [];
};

Given('the address book of the fake Paris', function theAddressBookOfTheFakeParis(this: FindAddressWorld) {
  theAddressBook(this, SERVED, CENTRE_OF_PARIS);
});

Given(
  'the address book of the fake Paris, around the map centred at longitude {float} and latitude {float}',
  function theAddressBookAroundSomewhere(this: FindAddressWorld, longitude: number, latitude: number) {
    theAddressBook(this, SERVED, { longitude, latitude });
  }
);

Given('the address book of the fake Paris cannot be loaded', function theAddressBookCannotBeLoaded(this: FindAddressWorld) {
  theAddressBook(this, FAILED, CENTRE_OF_PARIS);
});

Given('the places {string} found by name', function thePlacesFoundByName(this: FindAddressWorld, names: string) {
  this.places = names.split(', ').map(placeNamed);
});

When('the visitor looks up {string}', async function theVisitorLooksUp(this: FindAddressWorld, query: string) {
  const findFound = await firstValueFrom(
    findAddress({ loadAddresses: this.loadAddresses, indexAddresses: lazyAddressBook })(of(() => this.places))
  );
  this.found = findFound(query, this.reference);
});

Then('the first result is {string}', function theFirstResultIs(this: FindAddressWorld, line: string) {
  const [first] = this.found;
  assert.equal(first === undefined ? undefined : `${first.name}, ${first.address}`, line);
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

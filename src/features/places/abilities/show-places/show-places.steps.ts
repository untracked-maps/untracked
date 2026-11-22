import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, throwError } from 'rxjs';
import { FAMILIES, type Family, type LoadPlaces, type Place, type PlaceDot, showPlaces } from './domain/show-places';

type ShowPlacesWorld = World & {
  loadPlaces: LoadPlaces;
  openPlace: string | undefined;
  dots: readonly PlaceDot[];
};

const SOMEWHERE_IN_PARIS = { longitude: 2.3522, latitude: 48.8566 };

const familyOf = (family: string): Family | undefined => FAMILIES.find((known) => known === family);

const namesOf = (dots: readonly PlaceDot[]): string => dots.map(({ name }) => name).join(', ');

const orderOf = (world: ShowPlacesWorld, name: string): number | undefined =>
  world.dots.find((dot) => dot.name === name)?.order;

Given('these places', function thesePlaces(this: ShowPlacesWorld, table: DataTable) {
  const places = table.hashes().map(
    (row): Place => ({
      id: row['name'] ?? '',
      name: row['name'] ?? '',
      kind: row['kind'] ?? '',
      family: familyOf(row['family'] ?? ''),
      coordinates: SOMEWHERE_IN_PARIS,
      minzoom: Number(row['minzoom']),
      rank: Number(row['rank'])
    })
  );
  this.loadPlaces = (): Observable<readonly Place[]> => of(places);
});

Given('the places cannot be loaded', function thePlacesCannotBeLoaded(this: ShowPlacesWorld) {
  this.loadPlaces = (): Observable<readonly Place[]> => throwError(() => new Error('The places file answered 500.'));
});

Given('{string} is open in its sheet', function isOpenInItsSheet(this: ShowPlacesWorld, name: string) {
  this.openPlace = name;
});

Given('its sheet is closed', function itsSheetIsClosed(this: ShowPlacesWorld) {
  this.openPlace = undefined;
});

When('the map is at zoom {float}', function theMapIsAtZoom(this: ShowPlacesWorld, zoom: number) {
  showPlaces({ loadPlaces: this.loadPlaces })(of(zoom), of(this.openPlace)).subscribe((dots) => {
    this.dots = dots;
  });
});

Then('no place is shown', function noPlaceIsShown(this: ShowPlacesWorld) {
  assert.deepEqual(this.dots, []);
});

Then('the places shown are {string}', function thePlacesShownAre(this: ShowPlacesWorld, names: string) {
  assert.equal(namesOf(this.dots), names);
});

Then('{string} goes before {string}', function goesBefore(this: ShowPlacesWorld, first: string, second: string) {
  assert.ok((orderOf(this, first) ?? Number.NaN) < (orderOf(this, second) ?? Number.NaN));
});

Then('{string} goes along with {string}', function goesAlongWith(this: ShowPlacesWorld, first: string, second: string) {
  assert.deepEqual([orderOf(this, first)], [orderOf(this, second) ?? Number.NaN]);
});

Then('the places go in this order: {string}', function thePlacesGoInThisOrder(this: ShowPlacesWorld, names: string) {
  assert.equal(namesOf(this.dots.toSorted((first, second) => first.order - second.order)), names);
});

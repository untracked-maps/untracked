import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { fakeParis } from '#libraries/fake-paris/fake-paris';
import { type Coordinates, type LoadPlaces, PLACE_KINDS, type Place, type PlaceKind } from '../../domain/place';
import { kindNamedIn } from './domain/kind-words';
import { type KindSearch, searchByType } from './domain/search-by-type';

type SearchByTypeWorld = World & {
  loadPlaces: LoadPlaces;
  mapView: Observable<{ readonly center: Coordinates }>;
  named: PlaceKind | undefined;
  search: KindSearch;
};

const KINDS_SAID: Readonly<Record<string, PlaceKind>> = {
  bakeries: 'bakery',
  pharmacies: 'pharmacy',
  hospitals: 'hospital'
};

const placesListed = (search: KindSearch): readonly string[] =>
  search.status === 'found' ? search.places.map(({ name }) => name) : [];

const KNOWN_KINDS: ReadonlySet<string> = new Set(PLACE_KINDS);

const isPlaceKind = (kind: string): kind is PlaceKind => KNOWN_KINDS.has(kind);

Given('the places of the fake Paris, around the centre of the map', function thePlacesAroundTheCentre(this: SearchByTypeWorld) {
  this.loadPlaces = (): Observable<readonly Place[]> => of(fakeParis());
  this.mapView = of();
});

Given(
  'the places of the fake Paris, around the map centred at longitude {float} and latitude {float}',
  function thePlacesAroundSomewhere(this: SearchByTypeWorld, longitude: number, latitude: number) {
    this.loadPlaces = (): Observable<readonly Place[]> => of(fakeParis());
    this.mapView = of({ center: { longitude, latitude } });
  }
);

Given(
  'the places of the fake Paris cannot be loaded, around the centre of the map',
  function thePlacesCannotBeLoaded(this: SearchByTypeWorld) {
    this.loadPlaces = (): Observable<readonly Place[]> => throwError(() => new Error('The places file answered 500.'));
    this.mapView = of();
  }
);

When('the visitor types {string}', function theVisitorTypes(this: SearchByTypeWorld, query: string) {
  this.named = kindNamedIn(query);
});

When('the visitor looks for {string}', function theVisitorLooksFor(this: SearchByTypeWorld, kind: string) {
  assert.ok(isPlaceKind(kind));
  new TestScheduler(assert.deepEqual).run(({ cold, flush }) => {
    searchByType({ loadPlaces: this.loadPlaces })({ chosen: cold('-k', { k: kind }), mapView: this.mapView }).subscribe(
      (search) => {
        this.search = search;
      }
    );
    flush();
  });
});

Then(
  'the search field offers the {word} near the visitor',
  function theSearchFieldOffers(this: SearchByTypeWorld, kinds: string) {
    assert.equal(this.named, KINDS_SAID[kinds]);
  }
);

Then('the search field offers no kind of place', function theSearchFieldOffersNoKind(this: SearchByTypeWorld) {
  assert.equal(this.named, undefined);
});

Then('the first place listed is {string}', function theFirstPlaceListedIs(this: SearchByTypeWorld, name: string) {
  assert.equal(placesListed(this.search)[0], name);
});

Then('{int} places are listed', function placesAreListed(this: SearchByTypeWorld, count: number) {
  assert.equal(placesListed(this.search).length, count);
});

Then('the visitor is told that no such place is near', function noSuchPlaceIsNear(this: SearchByTypeWorld) {
  assert.equal(this.search.status, 'none-near');
});

Then('the visitor is told that the list is unavailable', function theListIsUnavailable(this: SearchByTypeWorld) {
  assert.equal(this.search.status, 'unavailable');
});

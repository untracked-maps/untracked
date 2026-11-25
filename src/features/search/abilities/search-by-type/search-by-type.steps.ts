import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { type Coordinates, type LoadPlaces, PLACE_KINDS, type Place, type PlaceKind } from '../../domain/place';
import { CATEGORY_KEYS, type CategoryKey } from './domain/categories';
import { categoryNamedIn } from './domain/category-words';
import { type KindSearch, placesFoundAt, searchByType } from './domain/search-by-type';

type SearchByTypeWorld = World & {
  loadPlaces: LoadPlaces;
  mapView: Observable<{ readonly center: Coordinates }>;
  named: CategoryKey | undefined;
  search: KindSearch;
};

const placesListed = (search: KindSearch): readonly string[] =>
  search.status === 'found' ? search.places.map(({ name }) => name) : [];

const KNOWN_KINDS: ReadonlySet<string> = new Set(PLACE_KINDS);

const isPlaceKind = (kind: string): kind is PlaceKind => KNOWN_KINDS.has(kind);

const KNOWN_CATEGORIES: ReadonlySet<string> = new Set(CATEGORY_KEYS);

const isCategory = (category: string): category is CategoryKey => KNOWN_CATEGORIES.has(category);

const CENTRE_OF_PARIS: Coordinates = { longitude: 2.3522, latitude: 48.8566 };

const DEGREES_BETWEEN_NEIGHBOURS = 0.0001;

const kindOf = (kind: string): PlaceKind => {
  assert.ok(isPlaceKind(kind));
  return kind;
};

const categoryOf = (category: string): CategoryKey => {
  assert.ok(isCategory(category));
  return category;
};

const aroundTheMap = (world: SearchByTypeWorld, places: readonly Place[]): void => {
  world.loadPlaces = (): Observable<readonly Place[]> => of(places);
  world.mapView = of();
};

Given('these places around the map', function thesePlacesAroundTheMap(this: SearchByTypeWorld, table: DataTable) {
  aroundTheMap(
    this,
    table.hashes().map(
      (row, index): Place => ({
        id: `place-${index}`,
        name: row['name'] ?? '',
        kind: kindOf(row['kind'] ?? ''),
        address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
        coordinates: { longitude: Number(row['longitude']), latitude: Number(row['latitude']) },
        fame: 0
      })
    )
  );
});

Given(
  '{int} places of kind {string} around the centre of the map',
  function placesOfKindAroundTheCentre(this: SearchByTypeWorld, count: number, kind: string) {
    aroundTheMap(
      this,
      Array.from(
        { length: count },
        (_, index): Place => ({
          id: `place-${index}`,
          name: `${kind} ${index}`,
          kind: kindOf(kind),
          address: { postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' },
          coordinates: {
            longitude: CENTRE_OF_PARIS.longitude + index * DEGREES_BETWEEN_NEIGHBOURS,
            latitude: CENTRE_OF_PARIS.latitude
          },
          fame: 0
        })
      )
    );
  }
);

Given(
  'the map is centred at longitude {float} and latitude {float}',
  function theMapIsCentredAt(this: SearchByTypeWorld, longitude: number, latitude: number) {
    this.mapView = of({ center: { longitude, latitude } });
  }
);

Given('the places around the map cannot be loaded', function thePlacesCannotBeLoaded(this: SearchByTypeWorld) {
  this.loadPlaces = (): Observable<readonly Place[]> => throwError(() => new Error('The places file answered 500.'));
  this.mapView = of();
});

When('the visitor types {string}', function theVisitorTypes(this: SearchByTypeWorld, query: string) {
  this.named = categoryNamedIn(query);
});

When('the visitor looks for {string}', function theVisitorLooksFor(this: SearchByTypeWorld, category: string) {
  new TestScheduler(assert.deepEqual).run(({ cold, flush }) => {
    searchByType({ loadPlaces: this.loadPlaces })({
      chosen: cold('-k', { k: categoryOf(category) }),
      mapView: this.mapView
    }).subscribe((search) => {
      this.search = search;
    });
    flush();
  });
});

Then('the search field offers the category {string}', function theSearchFieldOffers(this: SearchByTypeWorld, category: string) {
  assert.equal(this.named, categoryOf(category));
});

Then('the search field offers no category', function theSearchFieldOffersNoCategory(this: SearchByTypeWorld) {
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

Then(
  'the map is told to show {int} place(s), the first at {float}, {float}',
  function theMapIsToldToShowThePlaces(this: SearchByTypeWorld, count: number, latitude: number, longitude: number) {
    const told: (readonly Coordinates[])[] = [];
    placesFoundAt(of(this.search)).subscribe((places) => {
      told.push(places);
    });
    assert.deepEqual([told.length, told[0]?.length, told[0]?.[0]], [1, count, { longitude, latitude }]);
  }
);

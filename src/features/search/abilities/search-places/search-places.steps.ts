import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, NEVER, type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import type { Place } from '../../domain/place';
import { viewOfChosenPlace } from './domain/chosen-place';
import { type FindPlaces, type SearchState, searchPlaces } from './domain/search-places';
import { miniSearchIndex } from './implementation/minisearch/minisearch-index';

type SearchPlacesWorld = World & {
  places: readonly Place[];
  loadPlaces: () => Observable<readonly Place[]>;
  findPlaces: FindPlaces;
  mapView: Observable<{ readonly center: Place['coordinates'] }>;
  state: SearchState;
  view: { readonly center: Place['coordinates']; readonly zoom: number };
};

const placesFound = (state: SearchState): readonly string[] =>
  state.kind === 'found' ? state.places.map(({ name }) => name) : [];

const PARIS_CENTRE = { longitude: 2.3522, latitude: 48.8566 };

const placeFrom = (row: Readonly<Partial<Record<string, string>>>, index: number): Place => ({
  id: `place-${index}`,
  name: row['name'] ?? '',
  kind: 'attraction',
  address: {
    ...(row['house number'] === undefined ? {} : { houseNumber: row['house number'] }),
    street: row['street'] ?? '',
    postalCode: row['postal code'] ?? '75001',
    addressLocality: 'Paris',
    addressCountry: 'FR'
  },
  coordinates: {
    longitude: Number(row['longitude'] ?? PARIS_CENTRE.longitude),
    latitude: Number(row['latitude'] ?? PARIS_CENTRE.latitude)
  },
  fame: Number(row['fame'] ?? 0)
});

const indexed = async (world: SearchPlacesWorld, places: readonly Place[]): Promise<void> => {
  world.places = places;
  world.mapView = NEVER;
  world.findPlaces = await firstValueFrom(miniSearchIndex(places));
  world.loadPlaces = (): Observable<readonly Place[]> => of(places);
};

Given('these places to search', async function thesePlacesToSearch(this: SearchPlacesWorld, table: DataTable) {
  await indexed(this, table.hashes().map(placeFrom));
});

Given(
  '{int} places to search named {string}',
  async function placesToSearchNamed(this: SearchPlacesWorld, count: number, name: string) {
    await indexed(
      this,
      Array.from({ length: count }, (_, index) => placeFrom({ name }, index))
    );
  }
);

Given('the places to search are on their way', function thePlacesAreOnTheirWay(this: SearchPlacesWorld) {
  this.loadPlaces = (): Observable<readonly Place[]> => NEVER;
});

Given('the places to search cannot be loaded', function thePlacesCannotBeLoaded(this: SearchPlacesWorld) {
  this.loadPlaces = (): Observable<readonly Place[]> => throwError(() => new Error('The places file answered 500.'));
});

Given(
  'the visitor looks at the map around longitude {float} and latitude {float}',
  function theVisitorLooksAround(this: SearchPlacesWorld, longitude: number, latitude: number) {
    this.mapView = of({ center: { longitude, latitude } });
  }
);

When('the visitor searches for {string}', function theVisitorSearchesFor(this: SearchPlacesWorld, query: string) {
  new TestScheduler(assert.deepEqual).run(({ cold, flush }) => {
    searchPlaces({ loadPlaces: this.loadPlaces, indexPlaces: () => of(this.findPlaces) })({
      wake: of(undefined),
      query: cold('-q', { q: query }),
      mapView: this.mapView
    }).subscribe((state) => {
      this.state = state;
    });
    flush();
  });
});

When(
  'the visitor chooses {string} on a map at zoom level {float}',
  function theVisitorChooses(this: SearchPlacesWorld, name: string, zoom: number) {
    const chosen = this.places.find((place) => place.name === name);
    assert.ok(chosen);
    this.view = viewOfChosenPlace(chosen, zoom);
  }
);

Then('the first place found is {string}', function theFirstPlaceFoundIs(this: SearchPlacesWorld, name: string) {
  assert.equal(placesFound(this.state)[0], name);
});

Then('the first place found stands in {string}', function theFirstPlaceFoundStandsIn(this: SearchPlacesWorld, street: string) {
  assert.equal(this.state.kind === 'found' && this.state.places[0]?.address.street, street);
});

Then('the place found after it is {string}', function thePlaceFoundAfterItIs(this: SearchPlacesWorld, name: string) {
  assert.equal(placesFound(this.state)[1], name);
});

Then('{int} places are found', function placesAreFound(this: SearchPlacesWorld, count: number) {
  assert.equal(placesFound(this.state).length, count);
});

Then(
  'the visitor is told that no place is named {string}',
  function theVisitorIsToldNoPlaceIsNamed(this: SearchPlacesWorld, query: string) {
    assert.deepEqual(this.state, { kind: 'not-found', query });
  }
);

Then('nothing is searched', function nothingIsSearched(this: SearchPlacesWorld) {
  assert.equal(this.state.kind, 'idle');
});

Then('the visitor is told that the search is on its way', function theSearchIsOnItsWay(this: SearchPlacesWorld) {
  assert.equal(this.state.kind, 'searching');
});

Then('the visitor is told that the search is unavailable', function theSearchIsUnavailable(this: SearchPlacesWorld) {
  assert.equal(this.state.kind, 'unavailable');
});

Then(
  'the map flies to longitude {float} and latitude {float}',
  function theMapFliesTo(this: SearchPlacesWorld, longitude: number, latitude: number) {
    assert.deepEqual(this.view.center, { longitude, latitude });
  }
);

Then('the map shows the place at zoom level {float}', function theMapShowsThePlaceAt(this: SearchPlacesWorld, zoom: number) {
  assert.equal(this.view.zoom, zoom);
});

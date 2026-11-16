import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, NEVER, type Observable, of, throwError } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { fakeParis } from '#libraries/fake-paris/fake-paris';
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

const fakeParisIndexed = async (world: SearchPlacesWorld): Promise<void> => {
  world.places = fakeParis();
  world.mapView = NEVER;
  world.findPlaces = await firstValueFrom(miniSearchIndex(world.places));
};

Given('the places of the fake Paris', async function thePlacesOfTheFakeParis(this: SearchPlacesWorld) {
  await fakeParisIndexed(this);
  this.loadPlaces = (): Observable<readonly Place[]> => of(this.places);
});

Given('the places of the fake Paris are on their way', async function thePlacesAreOnTheirWay(this: SearchPlacesWorld) {
  await fakeParisIndexed(this);
  this.loadPlaces = (): Observable<readonly Place[]> => NEVER;
});

Given('the places of the fake Paris cannot be loaded', async function thePlacesCannotBeLoaded(this: SearchPlacesWorld) {
  await fakeParisIndexed(this);
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

Then('the first place found stands at {string}', function theFirstPlaceFoundStandsAt(this: SearchPlacesWorld, address: string) {
  assert.equal(this.state.kind === 'found' && this.state.places[0]?.address, address);
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

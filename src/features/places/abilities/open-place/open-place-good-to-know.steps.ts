import assert from 'node:assert/strict';
import { type DataTable, Given, Then, type World } from '@cucumber/cucumber';
import { type Observable, of } from 'rxjs';
import { goodToKnowOf } from './domain/good-to-know';
import type { PlaceSheet, SheetPlace } from './domain/open-place';

type GoodToKnowWorld = World & {
  places: Observable<readonly SheetPlace[]>;
  sheet: PlaceSheet;
};

const SPACES = / /gu;

const factOf = ([fact, sign]: readonly string[]): readonly [string, string] => [
  (fact ?? '').replaceAll(SPACES, '-'),
  sign ?? ''
];

const openedFacts = (world: GoodToKnowWorld): readonly (readonly [string, string])[] =>
  (world.sheet.status === 'open' ? goodToKnowOf(world.sheet.place.tags) : []).map(
    ({ fact, sign }): readonly [string, string] => [fact, sign]
  );

Given('a place tagged', function aPlaceTagged(this: GoodToKnowWorld, table: DataTable) {
  this.places = of([
    { id: 'tagged', name: 'Lieu', tags: table.rowsHash(), coordinates: { longitude: 2.3388, latitude: 48.8531 } }
  ]);
});

Then('it is good to know that', function itIsGoodToKnowThat(this: GoodToKnowWorld, table: DataTable) {
  assert.deepEqual(openedFacts(this), table.raw().map(factOf));
});

Then('nothing is good to know', function nothingIsGoodToKnow(this: GoodToKnowWorld) {
  assert.deepEqual(openedFacts(this), []);
});

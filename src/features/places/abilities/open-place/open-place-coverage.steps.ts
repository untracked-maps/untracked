import assert from 'node:assert/strict';
import { Given, Then, type World } from '@cucumber/cucumber';
import type { Area } from '../../domain/coverage';
import type { PlaceSheet } from './domain/open-place';

type CoverageWorld = World & {
  areas: readonly Area[];
  sheet: PlaceSheet;
};

const outOfAreaOf = (sheet: PlaceSheet): boolean => sheet.status === 'open' && sheet.outOfArea === true;

Given('the detailed data covers the box {string}', function theDetailedDataCovers(this: CoverageWorld, box: string) {
  const [west = 0, south = 0, east = 0, north = 0] = box.split(',').map(Number);
  this.areas = [{ west, south, east, north }];
});

Given('the detailed data covers no city', function theDetailedDataCoversNoCity(this: CoverageWorld) {
  this.areas = [];
});

Then('the sheet says the place is out of the cities covered', function theSheetSaysOutOfArea(this: CoverageWorld) {
  assert.equal(outOfAreaOf(this.sheet), true);
});

Then(
  'the sheet does not say the place is out of the cities covered',
  function theSheetDoesNotSayOutOfArea(this: CoverageWorld) {
    assert.equal(outOfAreaOf(this.sheet), false);
  }
);

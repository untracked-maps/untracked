import assert from 'node:assert/strict';
import { type DataTable, Given, Then, type World } from '@cucumber/cucumber';
import { type Observable, of } from 'rxjs';
import type { PlaceSheet, SheetPlace } from './domain/open-place';

type Row = Readonly<Partial<Record<string, string>>>;

type ReachWorld = World & {
  places: Observable<readonly SheetPlace[]>;
  sheet: PlaceSheet;
};

const WAYS = ['phone', 'website', 'menu', 'instagram', 'facebook'] as const;

type Ways = Partial<Record<(typeof WAYS)[number], string>>;

const waysOf = (row: Row | SheetPlace | undefined): Ways =>
  Object.fromEntries(
    WAYS.flatMap((way) => {
      const value = row?.[way];
      return value === undefined || value === '' ? [] : [[way, value]];
    })
  );

const placeToReach = (row: Row): SheetPlace => ({
  id: row['id'] ?? '',
  name: row['name'] ?? '',
  ...waysOf(row),
  coordinates: { longitude: 2.3388, latitude: 48.8531 }
});

const openedWays = (world: ReachWorld): Ways => waysOf(world.sheet.status === 'open' ? world.sheet.place : undefined);

Given('these places to reach', function thesePlacesToReach(this: ReachWorld, table: DataTable) {
  this.places = of(table.hashes().map(placeToReach));
});

Then('the place is reached by', function thePlaceIsReachedBy(this: ReachWorld, table: DataTable) {
  assert.deepEqual(openedWays(this), table.rowsHash());
});

Then('the place cannot be reached', function thePlaceCannotBeReached(this: ReachWorld) {
  assert.deepEqual(openedWays(this), {});
});

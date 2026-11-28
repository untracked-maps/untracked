import assert from 'node:assert/strict';
import { Then, When, type World } from '@cucumber/cucumber';
import { NEVER, type Observable, of } from 'rxjs';
import type { Area } from '../../domain/coverage';
import { type Opening, openPlace, type PlaceSheet, type SheetPlace } from './domain/open-place';

type LinkWorld = World & {
  places: Observable<readonly SheetPlace[]>;
  areas: readonly Area[];
  sheet: PlaceSheet;
};

const EARTH: Area = { west: -180, south: -90, east: 180, north: 90 };

const openedFromLink = (world: LinkWorld, opening: Opening): void => {
  openPlace({ loadPlaces: () => world.places ?? of([]), areas: world.areas ?? [EARTH] })({
    opened: of(opening),
    closed: NEVER
  }).subscribe((sheet) => {
    world.sheet = sheet;
  });
};

When(
  'the visitor opens {string} from a link at {float}, {float}',
  function theVisitorOpensFromLink(this: LinkWorld, id: string, latitude: number, longitude: number) {
    openedFromLink(this, { id, from: 'link', at: { longitude, latitude } });
  }
);

When(
  'the visitor opens {string} from a link without a position',
  function theVisitorOpensFromLinkWithoutPosition(this: LinkWorld, id: string) {
    openedFromLink(this, { id, from: 'link' });
  }
);

Then(
  'the place is missing, at {float}, {float}',
  function thePlaceIsMissingAt(this: LinkWorld, latitude: number, longitude: number) {
    assert.deepEqual(this.sheet, { status: 'missing', at: { longitude, latitude } });
  }
);

Then('the place is missing, without a point', function thePlaceIsMissingWithoutPoint(this: LinkWorld) {
  assert.deepEqual(this.sheet, { status: 'missing' });
});

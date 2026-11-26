import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { lastValueFrom, of } from 'rxjs';
import { type Glance, type GlanceColumn, type GlancePlace, glanceAtPlace } from './domain/glance-at-place';

type GlanceWorld = World & {
  place: GlancePlace;
  hoursShown?: boolean;
  position?: GlancePlace['coordinates'];
  glance: Glance;
};

const PLACE_AT = { longitude: 2.35, latitude: 48.85 };

const METRES_PER_DEGREE_OF_LATITUDE = 111_195;

const columnOf = (column: GlanceColumn): string => {
  switch (column.kind) {
    case 'wheelchair':
      return `wheelchair ${column.access}`;
    case 'entrance':
      return `entrance ${column.fee}`;
    default:
      return column.kind;
  }
};

Given('a glanced place tagged', function aGlancedPlaceTagged(this: GlanceWorld, table: DataTable) {
  this.place = { id: 'place', coordinates: PLACE_AT, tags: Object.fromEntries(table.raw()) };
});

Given('its opening hours are shown', function itsOpeningHoursAreShown(this: GlanceWorld) {
  this.hoursShown = true;
});

Given('the visitor stands {int} metres from it', function theVisitorStands(this: GlanceWorld, metres: number) {
  this.position = { longitude: PLACE_AT.longitude, latitude: PLACE_AT.latitude + metres / METRES_PER_DEGREE_OF_LATITUDE };
});

When('the visitor glances at it on {string}', async function theVisitorGlances(this: GlanceWorld, moment: string) {
  this.glance = await lastValueFrom(
    glanceAtPlace({
      opened: of(this.place),
      position: of(this.position),
      hoursShown: of(this.hoursShown ?? false),
      time: of(Date.parse(moment))
    })
  );
});

Then('the strip shows', function theStripShows(this: GlanceWorld, table: DataTable) {
  assert.deepEqual(this.glance.columns.map(columnOf), table.raw().flat());
});

Then('the strip shows nothing', function theStripShowsNothing(this: GlanceWorld) {
  assert.deepEqual(this.glance.columns, []);
});

Then(
  'its information was verified in month {string} of {string}',
  function itsInformationWasVerified(this: GlanceWorld, month: string, year: string) {
    assert.deepEqual(this.glance.freshness, { state: 'verified', checked: { year: Number(year), month: Number(month) } });
  }
);

Then(
  'its information has not been verified since month {string} of {string}',
  function itsInformationHasNotBeenVerified(this: GlanceWorld, month: string, year: string) {
    assert.deepEqual(this.glance.freshness, { state: 'not verified', checked: { year: Number(year), month: Number(month) } });
  }
);

Then('nothing is said of its freshness', function nothingIsSaidOfItsFreshness(this: GlanceWorld) {
  assert.equal(this.glance.freshness, undefined);
});

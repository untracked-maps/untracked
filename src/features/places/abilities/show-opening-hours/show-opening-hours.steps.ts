import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { lastValueFrom, of } from 'rxjs';
import {
  type ClockTime,
  type DayHours,
  type Moment,
  type OpeningStatus,
  readOpeningHours,
  statusAt,
  type Where,
  weekAt
} from './domain/opening-hours';
import { type HoursPlace, type HoursView, showOpeningHours } from './domain/show-opening-hours';

type HoursWorld = World & {
  place: HoursPlace;
  view: HoursView;
};

const CITIES: ReadonlyMap<string, Where> = new Map([
  ['Paris', { coordinates: { longitude: 2.3522, latitude: 48.8566 }, country: 'FR', timeZone: 'Europe/Paris' }],
  ['Los Angeles', { coordinates: { longitude: -118.2437, latitude: 34.0522 }, country: 'US', timeZone: 'America/Los_Angeles' }]
]);

const whereIn = (city: string): Where => CITIES.get(city) ?? { coordinates: { longitude: 0, latitude: 0 } };

const clockOf = ({ hour, minute }: ClockTime): string => `${hour}:${String(minute).padStart(2, '0')}`;

const dayOf = (hours: DayHours): string => {
  switch (hours.kind) {
    case 'open':
      return hours.ranges.map(({ from, to }) => `${clockOf(from)}-${clockOf(to)}`).join(', ');
    case 'all day':
      return 'all day';
    default:
      return hours.kind;
  }
};

const known = (world: HoursWorld): Extract<HoursView, { readonly status: 'known' }> => {
  if (world.view.status !== 'known') {
    throw new Error(`The opening hours are ${world.view.status}, not known.`);
  }
  return world.view;
};

const stateOf = (status: OpeningStatus): OpeningStatus['state'] => status.state;

const momentOf = (status: OpeningStatus): Moment | undefined => {
  switch (status.state) {
    case 'open':
      return status.closes;
    case 'closed':
      return status.opens;
    default:
      return undefined;
  }
};

const toldMoment = (moment: Moment | undefined): string => {
  if (moment === undefined) {
    return 'no change';
  }
  return moment.day === 'date'
    ? `the ${moment.date.day} of month ${moment.date.month}`
    : `${moment.day === 'weekday' ? moment.weekday : moment.day} at ${clockOf(moment.at)}`;
};

const nowOf = (world: HoursWorld): OpeningStatus => known(world).now;

Given(
  'a place in {} with the opening hours {string}',
  function aPlaceWithOpeningHours(this: HoursWorld, city: string, openingHours: string) {
    this.place = { id: 'place', kind: 'shop', openingHours, where: whereIn(city) };
  }
);

Given(
  'a place of kind {string} in {} without opening hours',
  function aPlaceWithoutOpeningHours(this: HoursWorld, kind: string, city: string) {
    this.place = { id: 'place', kind, where: whereIn(city) };
  }
);

When('the visitor opens it at {string}', async function theVisitorOpensItAt(this: HoursWorld, moment: string) {
  this.view = await lastValueFrom(
    showOpeningHours({ loadHoursReader: () => of({ readOpeningHours, statusAt, weekAt }) })({
      opened: of(this.place),
      time: of(Date.parse(moment))
    })
  );
});

Then('its week is', function itsWeekIs(this: HoursWorld, table: DataTable) {
  assert.deepEqual(
    known(this).week.map(({ weekday, hours }) => [weekday, dayOf(hours)]),
    table.raw()
  );
});

Then('today is {string}', function todayIs(this: HoursWorld, weekday: string) {
  assert.equal(known(this).week.find(({ today }) => today)?.weekday, weekday);
});

Then(
  'it is {string} until {string} at {string}',
  function itIsUntil(this: HoursWorld, state: string, day: string, clock: string) {
    assert.deepEqual([stateOf(nowOf(this)), toldMoment(momentOf(nowOf(this)))], [state, `${day} at ${clock}`]);
  }
);

Then(
  'it is {string} until the {string} of month {string}',
  function itIsUntilTheDate(this: HoursWorld, state: string, day: string, month: string) {
    assert.deepEqual([stateOf(nowOf(this)), toldMoment(momentOf(nowOf(this)))], [state, `the ${day} of month ${month}`]);
  }
);

Then('it is {string} with no change ahead', function itIsWithNoChangeAhead(this: HoursWorld, state: string) {
  assert.deepEqual([stateOf(nowOf(this)), toldMoment(momentOf(nowOf(this)))], [state, 'no change']);
});

Then('its state is uncertain', function itsStateIsUncertain(this: HoursWorld) {
  assert.equal(stateOf(nowOf(this)), 'uncertain');
});

Then('its opening hours cannot be read', function itsOpeningHoursCannotBeRead(this: HoursWorld) {
  assert.equal(this.view.status, 'unreadable');
});

Then('its opening hours are not known yet', function itsOpeningHoursAreNotKnownYet(this: HoursWorld) {
  assert.equal(this.view.status, 'unknown');
});

Then('no opening hours are shown', function noOpeningHoursAreShown(this: HoursWorld) {
  assert.equal(this.view.status, 'none');
});

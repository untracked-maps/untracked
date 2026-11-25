import { type DataTable, Given, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject, defer, type Observable, of, throwError } from 'rxjs';
import type { Departure, Line, Tags } from './domain/next-departures';
import { type Station, type StationView, showStation } from './domain/show-station';
import type { Exit } from './domain/station-exits';

type Row = Readonly<Partial<Record<string, string>>>;

type StationWorld = World & {
  stationId: string;
  lines: readonly Line[];
  exits?: readonly Exit[];
  departures?: readonly Departure[];
  failing?: boolean;
  asked: number;
  time?: BehaviorSubject<number>;
  opened?: BehaviorSubject<string | undefined>;
  shown?: BehaviorSubject<boolean>;
  view: StationView;
};

const DAY = '2026-11-24T';

const MINUTE = 60_000;

const timeAt = (clock: string): number => Date.parse(`${DAY}${clock}Z`);

const isoAt = (clock: string): string => new Date(timeAt(clock)).toISOString();

const tagsOf = (entries: readonly (readonly [string, string | undefined])[]): Tags =>
  Object.fromEntries(entries.filter((entry): entry is [string, string] => (entry[1] ?? '') !== ''));

const lineOf = (row: Row): Line => ({
  id: row['id'] ?? '',
  tags: tagsOf([
    ['route_master', row['route master']],
    ['ref', row['ref']],
    ['colour', row['colour']],
    ['text_colour', row['text colour']]
  ])
});

const exitOf = (row: Row): Exit => ({
  coordinates: { longitude: 2.355, latitude: 48.88 },
  tags: tagsOf([
    ['ref', row['ref']],
    ['name', row['name']],
    ['wheelchair', row['wheelchair']],
    ['conveying', row['conveying']]
  ])
});

const departureOf = (row: Row): Departure => {
  const expected = row['expected at'] ?? '';
  const status = row['status'] ?? '';
  return {
    lineRef: row['line'] ?? '',
    destinationName: row['destination'] ?? '',
    aimedDepartureTime: isoAt(row['at'] ?? ''),
    ...(expected === '' ? {} : { expectedDepartureTime: isoAt(expected) }),
    monitored: row['real time'] === 'yes',
    ...(status === 'cancelled' ? { departureStatus: 'cancelled' } : {})
  };
};

const timeOf = (world: StationWorld): BehaviorSubject<number> => {
  world.time ??= new BehaviorSubject(timeAt('10:00:00'));
  return world.time;
};

const stationOf = (world: StationWorld): Station => ({ id: world.stationId, lines: world.lines, exits: world.exits ?? [] });

const departuresOf = (world: StationWorld): Observable<readonly Departure[]> =>
  defer(() => {
    world.asked += 1;
    return world.failing === true ? throwError(() => new Error('The departures service failed.')) : of(world.departures ?? []);
  });

const started = (world: StationWorld): BehaviorSubject<string | undefined> => {
  if (world.opened !== undefined) {
    return world.opened;
  }
  const opened = new BehaviorSubject<string | undefined>(undefined);
  world.opened = opened;
  world.shown = new BehaviorSubject(true);
  world.asked = 0;
  showStation({
    loadStation: (id) => (id === world.stationId ? of(stationOf(world)) : throwError(() => new Error('Not a station.'))),
    loadDepartures: () => departuresOf(world)
  })({ opened, time: timeOf(world), shown: world.shown }).subscribe((view) => {
    world.view = view;
  });
  return opened;
};

Given(
  'the station {string} served by these lines',
  function theStationServedBy(this: StationWorld, id: string, table: DataTable) {
    this.stationId = id;
    this.lines = table.hashes().map(lineOf);
  }
);

Given('these exits of the station {string}', function theseExits(this: StationWorld, id: string, table: DataTable) {
  this.stationId = id;
  this.exits = table.hashes().map(exitOf);
});

Given(/^it is (?<clock>\d\d:\d\d:\d\d)$/u, function itIs(this: StationWorld, clock: string) {
  timeOf(this).next(timeAt(clock));
});

Given('these departures', function theseDepartures(this: StationWorld, table: DataTable) {
  this.failing = false;
  this.departures = table.hashes().map(departureOf);
});

Given(
  '{int} destinations of the line {string}, one minute apart from {word}',
  function destinationsOneMinuteApart(this: StationWorld, count: number, line: string, clock: string) {
    this.departures = Array.from({ length: count }, (_, index) => ({
      lineRef: line,
      destinationName: `Destination ${index + 1}`,
      aimedDepartureTime: new Date(timeAt(clock) + index * MINUTE).toISOString(),
      monitored: false
    }));
  }
);

Given('the departures service fails', function theDeparturesServiceFails(this: StationWorld) {
  this.failing = true;
});

When('the visitor opens the station {string}', function theVisitorOpensTheStation(this: StationWorld, id: string) {
  started(this).next(id);
});

When('the visitor closes the station', function theVisitorClosesTheStation(this: StationWorld) {
  started(this).next(undefined);
});

When('the page is hidden', function thePageIsHidden(this: StationWorld) {
  this.shown?.next(false);
});

When('the page is shown', function thePageIsShown(this: StationWorld) {
  this.shown?.next(true);
});

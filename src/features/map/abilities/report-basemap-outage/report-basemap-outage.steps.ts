import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { from, lastValueFrom } from 'rxjs';
import { type BasemapEvent, reportBasemapOutage } from './domain/report-basemap-outage';

type OutageWorld = World & {
  events: readonly BasemapEvent[];
};

const outageAfter = (events: readonly BasemapEvent[]): Promise<boolean> =>
  lastValueFrom(reportBasemapOutage({ basemapEvents: () => from(events) })());

Given('the map is open', function theMapIsOpen(this: OutageWorld) {
  this.events = [];
});

When('{int} tiles of the basemap fail in a row', function tilesOfTheBasemapFail(this: OutageWorld, count: number) {
  this.events = [...this.events, ...Array.from({ length: count }, () => 'tile-failed' as const)];
});

When('a tile of the basemap loads', function aTileOfTheBasemapLoads(this: OutageWorld) {
  this.events = [...this.events, 'tile-loaded'];
});

When('the provider of the basemap cannot be reached', function theProviderCannotBeReached(this: OutageWorld) {
  this.events = [...this.events, 'source-failed'];
});

Then('the visitor is told that the basemap is not responding', async function theVisitorIsToldOfTheOutage(this: OutageWorld) {
  assert.equal(await outageAfter(this.events), true);
});

Then('the visitor is told nothing', async function theVisitorIsToldNothing(this: OutageWorld) {
  assert.equal(await outageAfter(this.events), false);
});

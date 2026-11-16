import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject, defer, of, throwError } from 'rxjs';
import { showTransitLines, type TransitLine } from './domain/show-transit-lines';

const METRO_1: TransitLine = { mode: 'metro', colour: '#ffcd00', path: [] };

type TransitWorld = World & {
  shown: BehaviorSubject<boolean>;
  unreachable: boolean;
  fetches: number;
  drawn: readonly TransitLine[] | undefined;
};

Given('a visitor who never showed the transit lines', function aVisitorWhoNeverShowed(this: TransitWorld) {
  this.shown = new BehaviorSubject(false);
});

Given('a visitor who showed the transit lines on an earlier visit', function aVisitorWhoShowed(this: TransitWorld) {
  this.shown = new BehaviorSubject(true);
});

Given('transit lines that cannot be fetched', function linesThatCannotBeFetched(this: TransitWorld) {
  this.unreachable = true;
});

When('the map opens', function theMapOpens(this: TransitWorld) {
  this.fetches = 0;
  showTransitLines({
    shownTransitLines: () => this.shown.asObservable(),
    loadTransitLines: () =>
      defer(() => {
        this.fetches += 1;
        return this.unreachable ? throwError(() => new Error('No answer')) : of([METRO_1]);
      })
  })().subscribe((lines) => {
    this.drawn = lines;
  });
});

When('the visitor shows the transit lines', function theVisitorShows(this: TransitWorld) {
  this.shown.next(true);
});

When('the visitor hides the transit lines', function theVisitorHides(this: TransitWorld) {
  this.shown.next(false);
});

Then('the map draws no transit lines', function theMapDrawsNoLines(this: TransitWorld) {
  assert.equal(this.drawn, undefined);
});

Then('the map draws the transit lines', function theMapDrawsTheLines(this: TransitWorld) {
  assert.deepEqual(this.drawn, [METRO_1]);
});

Then('no transit lines are fetched', function noLinesAreFetched(this: TransitWorld) {
  assert.equal(this.fetches, 0);
});

Then('the transit lines were fetched once', function theLinesWereFetchedOnce(this: TransitWorld) {
  assert.equal(this.fetches, 1);
});

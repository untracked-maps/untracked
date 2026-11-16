import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject } from 'rxjs';
import { showBikeLanes } from './domain/show-bike-lanes';

type BikeLanesWorld = World & {
  shown: BehaviorSubject<boolean>;
  palette: BehaviorSubject<string>;
  drawn: string | undefined;
};

Given('a visitor who never showed the bike lanes', function aVisitorWhoNeverShowed(this: BikeLanesWorld) {
  this.shown = new BehaviorSubject(false);
});

Given('a visitor who showed the bike lanes on an earlier visit', function aVisitorWhoShowed(this: BikeLanesWorld) {
  this.shown = new BehaviorSubject(true);
});

When('the map is shown in the {string} palette', function theMapIsShownIn(this: BikeLanesWorld, palette: string) {
  this.palette = new BehaviorSubject(palette);
  showBikeLanes({ shownBikeLanes: () => this.shown.asObservable() })(this.palette.asObservable()).subscribe((drawn) => {
    this.drawn = drawn;
  });
});

When('the map turns to the {string} palette', function theMapTurnsTo(this: BikeLanesWorld, palette: string) {
  this.palette.next(palette);
});

When('the visitor shows the bike lanes', function theVisitorShows(this: BikeLanesWorld) {
  this.shown.next(true);
});

When('the visitor hides the bike lanes', function theVisitorHides(this: BikeLanesWorld) {
  this.shown.next(false);
});

Then('the map draws no bike lanes', function theMapDrawsNoLanes(this: BikeLanesWorld) {
  assert.equal(this.drawn, undefined);
});

Then(
  'the map draws the bike lanes in the {string} palette',
  function theMapDrawsTheLanes(this: BikeLanesWorld, palette: string) {
    assert.equal(this.drawn, palette);
  }
);

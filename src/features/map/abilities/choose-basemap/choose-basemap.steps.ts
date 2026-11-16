import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject, defer, of } from 'rxjs';
import { BASEMAPS, type Basemap, chooseBasemap } from './domain/choose-basemap';

const AERIAL_PHOTOS = 'aerial photos';

type BasemapWorld = World & {
  chosen: BehaviorSubject<Basemap>;
  fetches: number;
  drawn: string | undefined;
};

const basemap = (name: string): Basemap => BASEMAPS.find((choice) => choice === name) ?? 'plan';

Given('a visitor who never chose a basemap', function aVisitorWhoNeverChose(this: BasemapWorld) {
  this.chosen = new BehaviorSubject<Basemap>('plan');
});

Given(
  'a visitor who chose the {string} basemap on an earlier visit',
  function aVisitorWhoChoseEarlier(this: BasemapWorld, name: string) {
    this.chosen = new BehaviorSubject(basemap(name));
  }
);

When('the map is drawn', function theMapIsDrawn(this: BasemapWorld) {
  this.fetches = 0;
  chooseBasemap({
    chosenBasemap: () => this.chosen.asObservable(),
    loadSatelliteImagery: () =>
      defer(() => {
        this.fetches += 1;
        return of(AERIAL_PHOTOS);
      })
  })().subscribe((imagery) => {
    this.drawn = imagery;
  });
});

When('the visitor chooses the {string} basemap', function theVisitorChooses(this: BasemapWorld, name: string) {
  this.chosen.next(basemap(name));
});

Then('the map draws no aerial photos', function theMapDrawsNoPhotos(this: BasemapWorld) {
  assert.equal(this.drawn, undefined);
});

Then('the map draws the aerial photos', function theMapDrawsThePhotos(this: BasemapWorld) {
  assert.equal(this.drawn, AERIAL_PHOTOS);
});

Then('no aerial photos are fetched', function noPhotosAreFetched(this: BasemapWorld) {
  assert.equal(this.fetches, 0);
});

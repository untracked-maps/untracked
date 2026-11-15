import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { firstValueFrom, of } from 'rxjs';
import { type MapScene, showMap } from './domain/show-map';

const CENTRE_OF_PARIS = { longitude: 2.3522, latitude: 48.8566 };
const PROVIDER_BASEMAP = 'the basemap of the provider';

type MapWorld = World & {
  basemap: string;
  scene: MapScene<string>;
};

Given('the basemap of the provider', function theBasemapOfTheProvider(this: MapWorld) {
  this.basemap = PROVIDER_BASEMAP;
});

When('the visitor opens the map', async function theVisitorOpensTheMap(this: MapWorld) {
  this.scene = await firstValueFrom(showMap({ loadBasemap: () => of(this.basemap) })());
});

Then('the map is centred on Paris', function theMapIsCentredOnParis(this: MapWorld) {
  assert.deepEqual(this.scene.view.center, CENTRE_OF_PARIS);
});

Then('the map shows the city at zoom level {int}', function theMapShowsTheCityAtZoomLevel(this: MapWorld, zoom: number) {
  assert.equal(this.scene.view.zoom, zoom);
});

Then('the map shows that basemap', function theMapShowsThatBasemap(this: MapWorld) {
  assert.equal(this.scene.basemap, PROVIDER_BASEMAP);
});

import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { EMPTY, firstValueFrom, type Observable, of } from 'rxjs';
import { type CameraMove, frameMap, type MapMeasures } from './domain/frame-map';
import { type Coordinates, type MapScene, type MapView, showMap } from './domain/show-map';

const CENTRE_OF_PARIS = { longitude: 2.3522, latitude: 48.8566 };
const PROVIDER_BASEMAP = 'the basemap of the provider';

type MapWorld = World & {
  basemap: string;
  requestedView: MapView | undefined;
  scene: MapScene<string>;
  measures: MapMeasures;
  framedPlaces: readonly [Coordinates, ...Coordinates[]];
  move: CameraMove;
};

const NOTHING_COVERS: Pick<MapMeasures, 'topBarBottom' | 'sheet'> = { topBarBottom: 0, sheet: { layout: 'bottom', height: 0 } };

const coordinatesFrom = (row: Readonly<Record<string, string>>): Coordinates => ({
  longitude: Number(row['longitude']),
  latitude: Number(row['latitude'])
});

type Framing = {
  readonly placesOpened?: Observable<Coordinates>;
  readonly districtsOpened?: Observable<Coordinates>;
  readonly placesListed?: Observable<readonly [Coordinates, ...Coordinates[]]>;
};

const framedBy = async (world: MapWorld, framing: Framing): Promise<void> => {
  world.move = await firstValueFrom(
    frameMap({ measure: () => of(world.measures) })({
      placesOpened: EMPTY,
      districtsOpened: EMPTY,
      placesListed: EMPTY,
      ...framing
    })
  );
};

const flightOf = (move: CameraMove): Extract<CameraMove, { kind: 'flight' }> => {
  assert.equal(move.kind, 'flight');
  return move;
};

const fitOf = (move: CameraMove): Extract<CameraMove, { kind: 'fit' }> => {
  assert.equal(move.kind, 'fit');
  return move;
};

Given('the basemap of the provider', function theBasemapOfTheProvider(this: MapWorld) {
  this.basemap = PROVIDER_BASEMAP;
});

Given(
  'the map is asked to open at zoom level {int} on {float}, {float}',
  function theMapIsAskedToOpenAt(this: MapWorld, zoom: number, latitude: number, longitude: number) {
    this.requestedView = { center: { longitude, latitude }, zoom };
  }
);

When('the visitor opens the map', async function theVisitorOpensTheMap(this: MapWorld) {
  const requestedView$ = this.requestedView === undefined ? EMPTY : of(this.requestedView);
  this.scene = await firstValueFrom(showMap({ loadBasemap: () => of(this.basemap) })(requestedView$));
});

Then('the map is centred on Paris', function theMapIsCentredOnParis(this: MapWorld) {
  assert.deepEqual(this.scene.view.center, CENTRE_OF_PARIS);
});

Then('the map is centred on {float}, {float}', function theMapIsCentredOn(this: MapWorld, latitude: number, longitude: number) {
  assert.deepEqual(this.scene.view.center, { longitude, latitude });
});

Then('the map shows the city at zoom level {int}', function theMapShowsTheCityAtZoomLevel(this: MapWorld, zoom: number) {
  assert.equal(this.scene.view.zoom, zoom);
});

Then('the map shows that basemap', function theMapShowsThatBasemap(this: MapWorld) {
  assert.equal(this.scene.basemap, PROVIDER_BASEMAP);
});

Given(
  'a map of {int} by {int} pixels at zoom level {float}',
  function aMapOf(this: MapWorld, width: number, height: number, zoom: number) {
    this.measures = { width, height, zoom, ...NOTHING_COVERS };
  }
);

Given('a top bar down to {int} pixels', function aTopBarDownTo(this: MapWorld, topBarBottom: number) {
  this.measures = { ...this.measures, topBarBottom };
});

Given('a sheet {int} pixels tall at the bottom of the map', function aSheetTall(this: MapWorld, height: number) {
  this.measures = { ...this.measures, sheet: { layout: 'bottom', height } };
});

Given(
  'a side panel {int} pixels wide, ending {int} pixels from the left of the map',
  function aSidePanel(this: MapWorld, width: number, end: number) {
    this.measures = { ...this.measures, sheet: { layout: 'side', width, end } };
  }
);

Given('these places to frame', function thesePlacesToFrame(this: MapWorld, table: DataTable) {
  const [first, ...others] = table.hashes().map(coordinatesFrom);
  assert.ok(first);
  this.framedPlaces = [first, ...others];
});

When('a place opens at {float}, {float}', async function aPlaceOpens(this: MapWorld, latitude: number, longitude: number) {
  await framedBy(this, { placesOpened: of({ longitude, latitude }) });
});

When(
  'a district opens at {float}, {float}',
  async function aDistrictOpens(this: MapWorld, latitude: number, longitude: number) {
    await framedBy(this, { districtsOpened: of({ longitude, latitude }) });
  }
);

When('the places are framed', async function thePlacesAreFramed(this: MapWorld) {
  await framedBy(this, { placesListed: of(this.framedPlaces) });
});

Then(
  'the map flies to {float}, {float} in {int} ms',
  function theMapFliesTo(this: MapWorld, latitude: number, longitude: number, duration: number) {
    const { center, duration: flight } = flightOf(this.move);
    assert.deepEqual({ center, flight }, { center: { longitude, latitude }, flight: duration });
  }
);

Then(
  'the place stands {int} pixels right and {int} pixels below the centre of the map',
  function thePlaceStands(this: MapWorld, right: number, down: number) {
    assert.deepEqual(flightOf(this.move).offset, { right, down });
  }
);

Then('the map shows the place at zoom level {float}', function theMapShowsThePlaceAt(this: MapWorld, zoom: number) {
  assert.equal(flightOf(this.move).zoom, zoom);
});

Then('the map fits the places in {int} ms', function theMapFitsThePlaces(this: MapWorld, duration: number) {
  assert.equal(fitOf(this.move).duration, duration);
});

Then(
  'it fits the longitudes from {float} to {float}',
  function itFitsTheLongitudes(this: MapWorld, west: number, east: number) {
    const { bounds } = fitOf(this.move);
    assert.deepEqual([bounds.west, bounds.east], [west, east]);
  }
);

Then(
  'it fits the latitudes from {float} to {float}',
  function itFitsTheLatitudes(this: MapWorld, south: number, north: number) {
    const { bounds } = fitOf(this.move);
    assert.deepEqual([bounds.south, bounds.north], [south, north]);
  }
);

Then(
  'it keeps {int} pixels free at the top and {int} at the bottom',
  function itKeepsFreeAtTheTopAndBottom(this: MapWorld, top: number, bottom: number) {
    const { padding } = fitOf(this.move);
    assert.deepEqual([padding.top, padding.bottom], [top, bottom]);
  }
);

Then(
  'it keeps {int} pixels free on the left and {int} on the right',
  function itKeepsFreeOnTheSides(this: MapWorld, left: number, right: number) {
    const { padding } = fitOf(this.move);
    assert.deepEqual([padding.left, padding.right], [left, right]);
  }
);

Then('it goes no closer than zoom level {int}', function itGoesNoCloserThan(this: MapWorld, zoom: number) {
  assert.equal(fitOf(this.move).maxZoom, zoom);
});

Then('the move can be left out of the animation', function theMoveCanBeLeftOut(this: MapWorld) {
  assert.equal(this.move.essential, false);
});

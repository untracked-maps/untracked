import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { NEVER, type Observable, of } from 'rxjs';
import { type LocateMeStatus, type LocateResult, locateMe } from './domain/locate-me';

type LocateMeWorld = World & {
  position: Observable<LocateResult>;
  status: LocateMeStatus;
};

Given(
  'the visitor stands at longitude {float} and latitude {float}',
  function theVisitorStandsAt(this: LocateMeWorld, longitude: number, latitude: number) {
    this.position = of({ kind: 'located', position: { longitude, latitude } });
  }
);

Given('the position of the visitor has not arrived yet', function thePositionHasNotArrivedYet(this: LocateMeWorld) {
  this.position = NEVER;
});

Given('the visitor refuses to share their position', function theVisitorRefusesToShare(this: LocateMeWorld) {
  this.position = of({ kind: 'permission-denied' });
});

Given('the device cannot find the position of the visitor', function theDeviceCannotFindThePosition(this: LocateMeWorld) {
  this.position = of({ kind: 'position-unavailable' });
});

When('the visitor asks to be located', function theVisitorAsksToBeLocated(this: LocateMeWorld) {
  locateMe({ locate: () => this.position })(of(undefined))
    .subscribe((status) => {
      this.status = status;
    })
    .unsubscribe();
});

Then(
  'the map is centred on longitude {float} and latitude {float}',
  function theMapIsCentredOn(this: LocateMeWorld, longitude: number, latitude: number) {
    assert.deepEqual(this.status.kind === 'located' && this.status.view.center, { longitude, latitude });
  }
);

Then(
  'the map shows the street at zoom level {int}',
  function theMapShowsTheStreetAtZoomLevel(this: LocateMeWorld, zoom: number) {
    assert.equal(this.status.kind === 'located' && this.status.view.zoom, zoom);
  }
);

Then('the visitor is told that their position is being looked for', function theVisitorIsToldItIsLooking(this: LocateMeWorld) {
  assert.equal(this.status.kind, 'locating');
});

Then('the visitor is told that they did not allow it', function theVisitorIsToldTheyDidNotAllowIt(this: LocateMeWorld) {
  assert.equal(this.status.kind, 'permission-denied');
});

Then('the visitor is told that their position cannot be found', function theVisitorIsToldItCannotBeFound(this: LocateMeWorld) {
  assert.equal(this.status.kind, 'position-unavailable');
});

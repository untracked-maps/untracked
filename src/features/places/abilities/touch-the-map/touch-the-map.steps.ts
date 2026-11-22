import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { BehaviorSubject, Subject } from 'rxjs';
import { type Touch, type TouchOutcome, touchTheMap } from './domain/touch-the-map';

type TouchTheMapWorld = World & {
  sheetOpen: Subject<boolean>;
  touched: Subject<Touch>;
  outcome: TouchOutcome;
};

const touchesStarted = (world: TouchTheMapWorld): void => {
  if (world.touched !== undefined) {
    return;
  }
  world.sheetOpen ??= new Subject<boolean>();
  world.touched = new Subject<Touch>();
  touchTheMap({ touched: world.touched, sheetOpen: world.sheetOpen }).subscribe((outcome) => {
    world.outcome = outcome;
  });
};

const touch = (world: TouchTheMapWorld, touched: Touch): void => {
  touchesStarted(world);
  world.touched.next(touched);
};

Given('a sheet is open', function aSheetIsOpen(this: TouchTheMapWorld) {
  this.sheetOpen = new BehaviorSubject(true);
});

Given('the sheet is closed', function theSheetIsClosed(this: TouchTheMapWorld) {
  this.sheetOpen.next(false);
});

When(
  'the visitor touches the dot of {string} at longitude {float} and latitude {float}',
  function theVisitorTouchesTheDot(this: TouchTheMapWorld, place: string, longitude: number, latitude: number) {
    touch(this, { press: 'touch', spot: { longitude, latitude }, place });
  }
);

When(
  'the visitor long-presses the dot of {string} at longitude {float} and latitude {float}',
  function theVisitorLongPressesTheDot(this: TouchTheMapWorld, place: string, longitude: number, latitude: number) {
    touch(this, { press: 'long press', spot: { longitude, latitude }, place });
  }
);

When(
  'the visitor touches the map at longitude {float} and latitude {float}',
  function theVisitorTouchesTheMap(this: TouchTheMapWorld, longitude: number, latitude: number) {
    touch(this, { press: 'touch', spot: { longitude, latitude } });
  }
);

When(
  'the visitor long-presses the map at longitude {float} and latitude {float}',
  function theVisitorLongPressesTheMap(this: TouchTheMapWorld, longitude: number, latitude: number) {
    touch(this, { press: 'long press', spot: { longitude, latitude } });
  }
);

Then('the place {string} opens', function thePlaceOpens(this: TouchTheMapWorld, id: string) {
  assert.deepEqual(this.outcome, { kind: 'open place', id });
});

Then(
  'the sheet of the spot at longitude {float} and latitude {float} opens',
  function theSheetOfTheSpotOpens(this: TouchTheMapWorld, longitude: number, latitude: number) {
    assert.deepEqual(this.outcome, { kind: 'inspect spot', spot: { longitude, latitude } });
  }
);

Then('the sheet open closes', function theSheetOpenCloses(this: TouchTheMapWorld) {
  assert.deepEqual(this.outcome, { kind: 'close sheet' });
});

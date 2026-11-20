import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { NEVER, type Observable, of, Subject, throwError } from 'rxjs';
import { type Coordinates, type InspectedSpot, inspectPoint } from './domain/inspect-point';
import { nearestAddress } from './implementation/prerendered/nearest-address';
import type { KnownAddress } from './implementation/prerendered/prerendered-addresses';

type InspectPointWorld = World & {
  addresses: Observable<readonly KnownAddress[]>;
  inspected: Subject<Coordinates>;
  dismissed: Subject<void>;
  spot: InspectedSpot;
};

const inspectionStarted = (world: InspectPointWorld): void => {
  if (world.inspected !== undefined) {
    return;
  }
  world.inspected = new Subject<Coordinates>();
  world.dismissed = new Subject<void>();
  inspectPoint({ reverseGeocode: nearestAddress(() => world.addresses) })({
    inspected: world.inspected,
    dismissed: world.dismissed
  }).subscribe((spot) => {
    world.spot = spot;
  });
};

Given('these addresses on the map', function theseAddressesOnTheMap(this: InspectPointWorld, table: DataTable) {
  this.addresses = of(
    table.hashes().map(
      (row): KnownAddress => ({
        address: row['address'] ?? '',
        coordinates: { longitude: Number(row['longitude']), latitude: Number(row['latitude']) }
      })
    )
  );
});

Given('the addresses on the map are on their way', function theAddressesAreOnTheirWay(this: InspectPointWorld) {
  this.addresses = NEVER;
});

Given('the addresses on the map cannot be loaded', function theAddressesCannotBeLoaded(this: InspectPointWorld) {
  this.addresses = throwError(() => new Error('The addresses file answered 500.'));
});

When(
  'the visitor inspects the spot at longitude {float} and latitude {float}',
  function theVisitorInspects(this: InspectPointWorld, longitude: number, latitude: number) {
    inspectionStarted(this);
    this.inspected.next({ longitude, latitude });
  }
);

When('the visitor dismisses the spot', function theVisitorDismisses(this: InspectPointWorld) {
  this.dismissed.next();
});

Then('the visitor reads the address {string}', function theVisitorReadsTheAddress(this: InspectPointWorld, address: string) {
  assert.equal(this.spot.kind === 'address' && this.spot.address, address);
});

Then(
  'the visitor is told that there is no address at longitude {float} and latitude {float}',
  function theVisitorIsToldThereIsNoAddress(this: InspectPointWorld, longitude: number, latitude: number) {
    assert.deepEqual(this.spot, { kind: 'no-address', spot: { longitude, latitude } });
  }
);

Then('the visitor is told that the address is being looked for', function theAddressIsBeingLookedFor(this: InspectPointWorld) {
  assert.equal(this.spot.kind, 'looking');
});

Then('the visitor is told that the address is unavailable', function theAddressIsUnavailable(this: InspectPointWorld) {
  assert.equal(this.spot.kind, 'unavailable');
});

Then('no spot is inspected', function noSpotIsInspected(this: InspectPointWorld) {
  assert.equal(this.spot.kind, 'none');
});

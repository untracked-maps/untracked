import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, Subject, throwError } from 'rxjs';
import { type District, type DistrictSheet, type KnownOutline, openDistrict } from './domain/open-district';

type OpenDistrictWorld = World & {
  outlines: Observable<readonly KnownOutline[]>;
  opened: Subject<District>;
  closed: Subject<void>;
  sheet: DistrictSheet;
};

const opening = (world: OpenDistrictWorld): void => {
  if (world.opened !== undefined) {
    return;
  }
  world.opened = new Subject<District>();
  world.closed = new Subject<void>();
  openDistrict({ loadOutlines: () => world.outlines ?? of([]) })({ opened: world.opened, closed: world.closed }).subscribe(
    (sheet) => {
      world.sheet = sheet;
    }
  );
};

const boxOf = (row: Readonly<Record<string, string>>): KnownOutline['outline'] => {
  const [west, south, east, north] = ['west', 'south', 'east', 'north'].map((side) => Number(row[side]));
  return [
    { longitude: west ?? 0, latitude: south ?? 0 },
    { longitude: east ?? 0, latitude: south ?? 0 },
    { longitude: east ?? 0, latitude: north ?? 0 },
    { longitude: west ?? 0, latitude: north ?? 0 },
    { longitude: west ?? 0, latitude: south ?? 0 }
  ];
};

Given('these district outlines', function theseDistrictOutlines(this: OpenDistrictWorld, table: DataTable) {
  this.outlines = of(
    table
      .hashes()
      .map((row): KnownOutline => ({ name: row['name'] ?? '', postalCode: row['postcode'] ?? '', outline: boxOf(row) }))
  );
});

Given('the district outlines cannot be loaded', function theOutlinesCannotBeLoaded(this: OpenDistrictWorld) {
  this.outlines = throwError(() => new Error('The districts file answered 500.'));
});

When(
  'the visitor chooses the district {string} in {string}, {string}',
  function theVisitorChoosesTheDistrict(this: OpenDistrictWorld, name: string, postalCode: string, addressLocality: string) {
    opening(this);
    this.opened.next({ name, postalCode, addressLocality, coordinates: { longitude: 2.36, latitude: 48.859 } });
  }
);

When('the visitor closes the district', function theVisitorClosesTheDistrict(this: OpenDistrictWorld) {
  this.closed.next();
});

Then(
  'the visitor reads the district {string} in {string}',
  function theVisitorReadsTheDistrict(this: OpenDistrictWorld, name: string, city: string) {
    assert.deepEqual(this.sheet.status === 'open' && [this.sheet.district.name, this.sheet.district.addressLocality], [
      name,
      city
    ]);
  }
);

Then('the district is outlined', function theDistrictIsOutlined(this: OpenDistrictWorld) {
  assert.ok(this.sheet.status === 'open' && this.sheet.outline.length > 0);
});

Then('the district is not outlined', function theDistrictIsNotOutlined(this: OpenDistrictWorld) {
  assert.deepEqual(this.sheet.status === 'open' && this.sheet.outline, []);
});

Then('no district is open', function noDistrictIsOpen(this: OpenDistrictWorld) {
  assert.equal(this.sheet.status, 'closed');
});

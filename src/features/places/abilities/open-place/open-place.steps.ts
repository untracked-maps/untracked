import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { type Observable, of, Subject, share, throwError } from 'rxjs';
import { copyAddress, type Opening, openPlace, type PlaceSheet, placesOpenedAt, type SheetPlace } from './domain/open-place';

type Row = Readonly<Partial<Record<string, string>>>;

type OpenPlaceWorld = World & {
  places: Observable<readonly SheetPlace[]>;
  copyRefused: boolean;
  opened: Subject<Opening>;
  closed: Subject<void>;
  sheet: PlaceSheet;
  copiedTexts: string[];
  copied: string;
  shownOnMap: SheetPlace['coordinates'][];
};

const filled = (value: string | undefined): string | undefined => (value === '' ? undefined : value);

const addressOf = (row: Row): Pick<SheetPlace, 'address'> => {
  const postalCode = filled(row['postal code']);
  const houseNumber = filled(row['house number']);
  return postalCode === undefined
    ? {}
    : {
        address: {
          ...(houseNumber === undefined ? {} : { houseNumber }),
          street: row['street'] ?? '',
          postalCode,
          addressLocality: 'Paris',
          addressCountry: 'FR'
        }
      };
};

const placeOf = (row: Row): SheetPlace => {
  const kind = filled(row['kind']);
  const cuisine = filled(row['cuisine']);
  return {
    id: row['id'] ?? '',
    name: row['name'] ?? '',
    ...(kind === undefined ? {} : { kind }),
    ...(cuisine === undefined ? {} : { cuisine }),
    ...addressOf(row),
    coordinates: { longitude: Number(row['longitude'] ?? '2.33'), latitude: Number(row['latitude'] ?? '48.85') }
  };
};

const sheetStarted = (world: OpenPlaceWorld): void => {
  if (world.opened !== undefined) {
    return;
  }
  world.opened = new Subject<Opening>();
  world.closed = new Subject<void>();
  world.shownOnMap = [];
  const sheet$ = openPlace({ loadPlaces: () => world.places ?? of([]) })({ opened: world.opened, closed: world.closed }).pipe(
    share()
  );
  placesOpenedAt(sheet$).subscribe((at) => {
    world.shownOnMap.push(at);
  });
  sheet$.subscribe((sheet) => {
    world.sheet = sheet;
  });
};

const openedPlace = (world: OpenPlaceWorld): SheetPlace | undefined =>
  world.sheet.status === 'open' ? world.sheet.place : undefined;

Given('these places to open', function thesePlacesToOpen(this: OpenPlaceWorld, table: DataTable) {
  this.places = of(table.hashes().map(placeOf));
});

Given('the places to open cannot be loaded', function thePlacesToOpenCannotBeLoaded(this: OpenPlaceWorld) {
  this.places = throwError(() => new Error('The places file answered 500.'));
});

Given('the device cannot copy', function theDeviceCannotCopy(this: OpenPlaceWorld) {
  this.copyRefused = true;
});

When('the visitor opens {string} from the search', function theVisitorOpensFromTheSearch(this: OpenPlaceWorld, id: string) {
  sheetStarted(this);
  this.opened.next({ id, from: 'search' });
});

When(
  'the visitor opens {string} from the list of a kind',
  function theVisitorOpensFromTheList(this: OpenPlaceWorld, id: string) {
    sheetStarted(this);
    this.opened.next({ id, from: 'kind list' });
  }
);

When('the visitor opens {string} from the map', function theVisitorOpensFromTheMap(this: OpenPlaceWorld, id: string) {
  sheetStarted(this);
  this.opened.next({ id, from: 'map' });
});

When('the visitor closes the sheet', function theVisitorClosesTheSheet(this: OpenPlaceWorld) {
  this.closed.next();
});

When('the visitor copies {string}', function theVisitorCopies(this: OpenPlaceWorld, text: string) {
  this.copiedTexts = [];
  const copyText = (copiedText: string): Observable<void> => {
    if (this.copyRefused) {
      return throwError(() => new Error('The clipboard refused.'));
    }
    this.copiedTexts.push(copiedText);
    return of(undefined);
  };
  copyAddress({ copyText })(of(text)).subscribe((copied) => {
    this.copied = copied;
  });
});

Then('the sheet of {string} is open', function theSheetIsOpen(this: OpenPlaceWorld, name: string) {
  assert.equal(openedPlace(this)?.name, name);
});

Then('no sheet is open', function noSheetIsOpen(this: OpenPlaceWorld) {
  assert.equal(this.sheet.status, 'closed');
});

Then('its kind is {string}', function itsKindIs(this: OpenPlaceWorld, kind: string) {
  assert.equal(openedPlace(this)?.kind, kind);
});

Then('it has no kind', function itHasNoKind(this: OpenPlaceWorld) {
  assert.equal(openedPlace(this)?.kind, undefined);
});

Then('its cuisine is {string}', function itsCuisineIs(this: OpenPlaceWorld, cuisine: string) {
  assert.equal(openedPlace(this)?.cuisine, cuisine);
});

Then(
  'its address is {string}, {string}, {string}',
  function itsAddressIs(this: OpenPlaceWorld, houseNumber: string, street: string, postalCode: string) {
    assert.deepEqual(openedPlace(this)?.address, {
      houseNumber,
      street,
      postalCode,
      addressLocality: 'Paris',
      addressCountry: 'FR'
    });
  }
);

Then('it has no address', function itHasNoAddress(this: OpenPlaceWorld) {
  assert.equal(openedPlace(this)?.address, undefined);
});

Then('the sheet was opened from the search', function theSheetWasOpenedFromTheSearch(this: OpenPlaceWorld) {
  assert.equal(this.sheet.status === 'open' && this.sheet.from, 'search');
});

Then('the sheet was opened from the list of a kind', function theSheetWasOpenedFromTheList(this: OpenPlaceWorld) {
  assert.equal(this.sheet.status === 'open' && this.sheet.from, 'kind list');
});

Then('{string} is copied', function isCopied(this: OpenPlaceWorld, text: string) {
  assert.deepEqual(this.copiedTexts, [text]);
});

Then('the copy is reported done', function theCopyIsReportedDone(this: OpenPlaceWorld) {
  assert.equal(this.copied, 'copied');
});

Then('the copy is reported refused', function theCopyIsReportedRefused(this: OpenPlaceWorld) {
  assert.equal(this.copied, 'not copied');
});

Then('the sheet was opened from the map', function theSheetWasOpenedFromTheMap(this: OpenPlaceWorld) {
  assert.equal(this.sheet.status === 'open' && this.sheet.from, 'map');
});

Then(
  'the map is told to show {int} place(s), the last at {float}, {float}',
  function theMapIsToldToShow(this: OpenPlaceWorld, count: number, latitude: number, longitude: number) {
    assert.deepEqual([this.shownOnMap.length, this.shownOnMap.at(-1)], [count, { longitude, latitude }]);
  }
);

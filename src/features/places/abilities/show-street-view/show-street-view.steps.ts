import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { lastValueFrom, type Observable, of, throwError } from 'rxjs';
import { type Picture, type StreetView, showStreetView } from './domain/show-street-view';

type StreetViewPlace = {
  readonly id: string;
  readonly name: string;
  readonly coordinates: { readonly longitude: number; readonly latitude: number };
  readonly tags?: Readonly<Record<string, string>>;
};

type StreetViewWorld = World & {
  pictures: ReadonlyMap<string, Picture>;
  place: StreetViewPlace;
  view: StreetView;
};

const PRECISION = 3;

const loadPictureFrom =
  (pictures: ReadonlyMap<string, Picture>) =>
  (id: string): Observable<Picture> => {
    const picture = pictures.get(id);
    return picture === undefined ? throwError(() => new Error(`No picture ${id}`)) : of(picture);
  };

Given(
  'a picture {string} taken at {float}, {float}',
  function aPictureTakenAt(this: StreetViewWorld, id: string, longitude: number, latitude: number) {
    this.pictures = new Map([[id, { image: 'street-views/cafe-01.svg', camera: { longitude, latitude }, azimuth: 0 }]]);
  }
);

Given('its image is {string}', function itsImageIs(this: StreetViewWorld, image: string) {
  this.pictures = new Map([...this.pictures].map(([id, picture]) => [id, { ...picture, image }]));
});

Given('its camera heading {int}°', function itsCameraHeading(this: StreetViewWorld, azimuth: number) {
  this.pictures = new Map([...this.pictures].map(([id, picture]) => [id, { ...picture, azimuth }]));
});

Given('no picture can be read', function noPictureCanBeRead(this: StreetViewWorld) {
  this.pictures = new Map();
});

Given(
  'a place tagged {string} at {float}, {float}',
  function aPlaceTagged(this: StreetViewWorld, panoramax: string, longitude: number, latitude: number) {
    this.place = { id: 'place', name: 'Chez Paul', coordinates: { longitude, latitude }, tags: { panoramax } };
  }
);

Given(
  'a place without a street view at {float}, {float}',
  function aPlaceWithNoStreetView(this: StreetViewWorld, longitude: number, latitude: number) {
    this.place = { id: 'place', name: 'Chez Paul', coordinates: { longitude, latitude }, tags: { amenity: 'cafe' } };
  }
);

When('the visitor opens its sheet', async function theVisitorOpensItsSheet(this: StreetViewWorld) {
  this.view = await lastValueFrom(showStreetView({ loadPicture: loadPictureFrom(this.pictures) })({ opened: of(this.place) }));
});

When('the visitor opens its sheet, then closes it', async function theVisitorOpensItsSheetThenClosesIt(this: StreetViewWorld) {
  this.view = await lastValueFrom(
    showStreetView({ loadPicture: loadPictureFrom(this.pictures) })({ opened: of(this.place, undefined) })
  );
});

Then(
  'the street view shows {string} facing {float} of its width',
  function theStreetViewShows(this: StreetViewWorld, image: string, facing: number) {
    const shown = this.view.status === 'shown' ? { image: this.view.image, facing: this.view.facing.toFixed(PRECISION) } : {};
    assert.deepEqual(shown, { image, facing: facing.toFixed(PRECISION) });
  }
);

Then('there is no street view', function thereIsNoStreetView(this: StreetViewWorld) {
  assert.deepEqual(this.view, { status: 'none' });
});

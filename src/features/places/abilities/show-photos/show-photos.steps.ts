import assert from 'node:assert/strict';
import { type DataTable, Given, Then, When, type World } from '@cucumber/cucumber';
import { lastValueFrom, of } from 'rxjs';
import { type Photos, showPhotos } from './domain/show-photos';

type PhotoPlace = { readonly id: string; readonly tags?: Readonly<Record<string, string>> };

type PhotosWorld = World & {
  place: PhotoPlace;
  photos: Photos;
};

Given('a photographed place tagged {string}', function aPhotographedPlaceTagged(this: PhotosWorld, image: string) {
  this.place = { id: 'place', tags: { image } };
});

Given('a photographed place without the key', function aPhotographedPlaceWithoutTheKey(this: PhotosWorld) {
  this.place = { id: 'place', tags: { name: 'Chez Paul' } };
});

When('the visitor opens it', async function theVisitorOpensIt(this: PhotosWorld) {
  this.photos = await lastValueFrom(showPhotos({ opened: of(this.place) }));
});

When('the visitor opens it, then closes it', async function theVisitorOpensItThenClosesIt(this: PhotosWorld) {
  this.photos = await lastValueFrom(showPhotos({ opened: of(this.place, undefined) }));
});

Then('its photos are', function itsPhotosAre(this: PhotosWorld, table: DataTable) {
  assert.deepEqual(this.photos, table.raw().flat());
});

Then('it has no photo', function itHasNoPhoto(this: PhotosWorld) {
  assert.deepEqual(this.photos, []);
});

import { lastValueFrom, of, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Photos, showPhotos } from './show-photos';

type PhotoPlace = { readonly id: string; readonly tags?: Readonly<Record<string, string>> };

const placeTagged = (image: string): PhotoPlace => ({ id: 'cafe', tags: { image } });

const photosShown = (...opened: readonly (PhotoPlace | undefined)[]): Promise<Photos> =>
  lastValueFrom(showPhotos({ opened: of(...opened) }));

const everyShowing = (...opened: readonly (PhotoPlace | undefined)[]): Promise<readonly Photos[]> =>
  lastValueFrom(showPhotos({ opened: of(...opened) }).pipe(toArray()));

describe('the photos of a place', () => {
  it('are the paths the key image names, in its order', async () => {
    expect(await photosShown(placeTagged('photos/cafe-02.svg;photos/cafe-01.svg'))).toEqual([
      'photos/cafe-02.svg',
      'photos/cafe-01.svg'
    ]);
  });

  it('are none without the key', async () => {
    expect(await photosShown({ id: 'cafe', tags: { name: 'Chez Paul' } })).toEqual([]);
  });

  it('may be in a folder of a folder', async () => {
    expect(await photosShown(placeTagged('photos/paris/cafe-01.svg'))).toEqual(['photos/paris/cafe-01.svg']);
  });

  it('are none without tags', async () => {
    expect(await photosShown({ id: 'cafe' })).toEqual([]);
  });

  it('leave out the spaces around a path', async () => {
    expect(await photosShown(placeTagged(' photos/cafe-01.svg '))).toEqual(['photos/cafe-01.svg']);
  });

  it('leave out an empty part', async () => {
    expect(await photosShown(placeTagged(';photos/cafe-01.svg;;'))).toEqual(['photos/cafe-01.svg']);
  });

  it('show a photo named twice once', async () => {
    expect(await photosShown(placeTagged('photos/cafe-01.svg;photos/cafe-01.svg'))).toEqual(['photos/cafe-01.svg']);
  });

  it.each([
    ['another site', 'https://upload.example/photo.jpg'],
    ['another site without its scheme', '//cdn.example/photo.jpg'],
    ['the root of the site', '/photos/cafe-01.svg'],
    ['data written in the address', 'data:image/svg+xml,<svg/>'],
    ['a folder only', 'photos'],
    ['a climb out of the site', 'photos/../secret.svg'],
    ['a capital letter', 'Photos/cafe-01.svg'],
    ['something after the name', 'photos/cafe-01.svg?x'],
    ['a file without its kind', 'photos/cafe-01'],
    ['a name with two dots', 'photos/cafe.01.svg']
  ])('leave out a photo of %s', async (_, path) => {
    expect(await photosShown(placeTagged(path))).toEqual([]);
  });
});

describe('the photos shown', () => {
  it('are none once the sheet closes', async () => {
    expect(await photosShown(placeTagged('photos/cafe-01.svg'), undefined)).toEqual([]);
  });

  it('are none before a sheet opens', async () => {
    expect(await everyShowing()).toEqual([[]]);
  });

  it('are shown once for two places with the same photos', async () => {
    expect(await everyShowing(placeTagged('photos/cafe-01.svg'), placeTagged('photos/cafe-01.svg'))).toEqual([
      [],
      ['photos/cafe-01.svg']
    ]);
  });

  it('are shown once for two places with the same two photos', async () => {
    const both = 'photos/cafe-01.svg;photos/cafe-02.svg';
    expect(await everyShowing(placeTagged(both), placeTagged(both))).toHaveLength(2);
  });

  it('are shown again for a place with other photos', async () => {
    expect(await everyShowing(placeTagged('photos/cafe-01.svg'), placeTagged('photos/cafe-02.svg'))).toEqual([
      [],
      ['photos/cafe-01.svg'],
      ['photos/cafe-02.svg']
    ]);
  });
});

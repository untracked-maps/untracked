import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import type { Picture } from '../../domain/show-street-view';
import { prerenderedPicture } from './prerendered-picture';

const urlOf = (id: string): string => `/data/panoramax/${id}.json`;

const answering =
  (body: unknown, status = 200) =>
  async (): Promise<Response> =>
    Response.json(body, { status });

const itemOf = (coordinates: unknown, azimuth: unknown, href: unknown): unknown => ({
  type: 'Feature',
  id: 'p-1',
  geometry: { type: 'Point', coordinates },
  properties: { 'view:azimuth': azimuth },
  assets: { hd: { href, type: 'image/svg+xml' } }
});

const readFrom = (body: unknown): Promise<Picture> => firstValueFrom(prerenderedPicture(answering(body), urlOf)('p-1'));

describe('a picture read from its prerendered file', () => {
  it('gives the image, the camera position and its heading', async () => {
    expect(await readFrom(itemOf([2.35, 48.85], 87, 'street-views/cafe-01.svg'))).toEqual({
      image: 'street-views/cafe-01.svg',
      camera: { longitude: 2.35, latitude: 48.85 },
      azimuth: 87
    });
  });

  it('reads the file of the picture asked', async () => {
    const urls: string[] = [];
    const fetchFile = (url: string): Promise<Response> => {
      urls.push(url);
      return answering(itemOf([0, 0], 0, 'a/b.svg'))();
    };
    await firstValueFrom(prerenderedPicture(fetchFile, urlOf)('b5c3-09'));
    expect(urls).toEqual(['/data/panoramax/b5c3-09.json']);
  });

  it('fails when the picture has no file', async () => {
    await expect(firstValueFrom(prerenderedPicture(answering({}, 404), urlOf)('p-1'))).rejects.toThrow(
      'The picture file answered 404.'
    );
  });

  it.each([
    { what: 'no geometry', item: { properties: { 'view:azimuth': 0 }, assets: { hd: { href: 'a/b.svg' } } } },
    { what: 'a longitude that is no number', item: itemOf(['2.35', 48.85], 0, 'a/b.svg') },
    { what: 'a latitude that is no number', item: itemOf([2.35, '48.85'], 0, 'a/b.svg') },
    { what: 'a latitude that is not finite', item: itemOf([2.35, null], 0, 'a/b.svg') },
    { what: 'a position that is no list', item: itemOf({ 0: 2.35, 1: 48.85 }, 0, 'a/b.svg') },
    { what: 'no heading', item: itemOf([2.35, 48.85], undefined, 'a/b.svg') },
    { what: 'a heading that is not finite', item: itemOf([2.35, 48.85], 'NaN', 'a/b.svg') },
    { what: 'nothing at all', item: null }
  ])('fails on a file with $what', async ({ item }) => {
    await expect(readFrom(item)).rejects.toThrow('The picture file gives no camera position or heading.');
  });

  it.each([
    { what: 'an address that is no text', item: itemOf([2.35, 48.85], 0, 3) },
    { what: 'no assets', item: { geometry: { coordinates: [2.35, 48.85] }, properties: { 'view:azimuth': 0 } } }
  ])('fails on a file with $what', async ({ item }) => {
    await expect(readFrom(item)).rejects.toThrow('The picture file gives no image.');
  });
});

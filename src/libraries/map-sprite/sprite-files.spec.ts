import { describe, expect, it } from 'vitest';
import { spriteFile, spriteFileNames } from './sprite-files';

const square = (id: string, size: number): { id: string; svg: string } => ({
  id,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#2B4793"/></svg>`
});

const SPRITE = { name: 'basemap', icons: [square('small', 10), square('large', 20)] };

const PNG_SIGNATURE = '89504e470d0a1a0a';

const PNG_WIDTH_OFFSET = 16;

const indexOf = async (name: string): Promise<unknown> =>
  JSON.parse(new TextDecoder().decode((await spriteFile(SPRITE, name))?.body));

const imageOf = async (name: string): Promise<Buffer> => Buffer.from((await spriteFile(SPRITE, name))?.body ?? []);

describe('sprite files', () => {
  it('names an index and an image for each pixel ratio, as MapLibre requests them', () => {
    expect(spriteFileNames(SPRITE)).toStrictEqual(['basemap.json', 'basemap.png', 'basemap@2x.json', 'basemap@2x.png']);
  });

  it('indexes every icon of the sheet', async () => {
    expect(new Set(Object.keys((await indexOf('basemap.json')) ?? {}))).toStrictEqual(new Set(['large', 'small']));
  });

  it('indexes the icons of the standard sheet at their own size', async () => {
    expect(await indexOf('basemap.json')).toMatchObject({ small: { width: 10, pixelRatio: 1 } });
  });

  it('indexes the icons of the high density sheet at twice their size', async () => {
    expect(await indexOf('basemap@2x.json')).toMatchObject({ small: { width: 20, pixelRatio: 2 } });
  });

  it('serves the index as JSON', async () => {
    expect((await spriteFile(SPRITE, 'basemap.json'))?.type).toBe('application/json');
  });

  it('serves the image as PNG', async () => {
    expect((await spriteFile(SPRITE, 'basemap@2x.png'))?.type).toBe('image/png');
  });

  it('draws the sheet as a PNG image', async () => {
    expect((await imageOf('basemap.png')).subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE);
  });

  it('draws the high density sheet twice as wide', async () => {
    expect((await imageOf('basemap@2x.png')).readUInt32BE(PNG_WIDTH_OFFSET)).toBe(60);
  });

  it('finds no file under another name', async () => {
    expect(await spriteFile(SPRITE, 'basemap@3x.png')).toBeUndefined();
  });
});

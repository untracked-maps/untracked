import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ignOrthophotos } from './ign-orthophotos';
import { orthophotos } from './orthophotos';

const tileUrl = (): URL =>
  new URL(
    Object.values(orthophotos.sources)
      .flatMap(({ tiles = [] }) => tiles)
      .at(0) ?? ''
  );

describe('orthophotos of IGN', () => {
  it('are loaded when asked for', async () => {
    expect(await firstValueFrom(ignOrthophotos())).toBe(orthophotos);
  });

  it('come from the WMTS of the Géoplateforme', () => {
    expect(`${tileUrl().origin}${tileUrl().pathname}`).toBe('https://data.geopf.fr/wmts');
  });

  it('ask the Géoplateforme for the tiles of its aerial photos, in JPEG', () => {
    expect([...tileUrl().searchParams]).toStrictEqual([
      ['SERVICE', 'WMTS'],
      ['REQUEST', 'GetTile'],
      ['VERSION', '1.0.0'],
      ['LAYER', 'ORTHOIMAGERY.ORTHOPHOTOS'],
      ['STYLE', 'normal'],
      ['TILEMATRIXSET', 'PM'],
      ['FORMAT', 'image/jpeg'],
      ['TILEMATRIX', '{z}'],
      ['TILEROW', '{y}'],
      ['TILECOL', '{x}']
    ]);
  });

  it('make a valid MapLibre style', () => {
    expect(
      validateStyleMin({ version: 8, sources: { ...orthophotos.sources }, layers: [...orthophotos.layers] })
    ).toStrictEqual([]);
  });

  it('are drawn in their own layer', () => {
    expect(orthophotos.layers.map(({ id }) => id)).toStrictEqual(['ign-orthophotos']);
  });

  it('are drawn from their own source', () => {
    expect(orthophotos.layers.map(({ source }) => source)).toStrictEqual(['ign-orthophotos']);
  });
});

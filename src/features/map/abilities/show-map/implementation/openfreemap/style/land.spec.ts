import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { landLayers } from './land';

const LIGHT = basemapPalettes.light;

describe('land layers', () => {
  it('stacks land, land uses, land cover and parks', () => {
    expect(landLayers(LIGHT).map(({ id }) => id)).toStrictEqual([
      'land',
      'landuse-alt',
      'landuse-green',
      'landcover',
      'landcover-wood',
      'park'
    ]);
  });

  it('lightens the land when seen from afar', () => {
    expect(landLayers(LIGHT)[0]).toHaveProperty(['paint', 'background-color', 4], LIGHT.landFar);
  });

  it('shows commercial and public land uses from zoom 12', () => {
    expect(landLayers(LIGHT)[1]).toHaveProperty('minzoom', 12);
  });

  it('paints grass, farmland and wetland as parks', () => {
    expect(landLayers(LIGHT)[3]).toHaveProperty(['paint', 'fill-color'], LIGHT.park);
  });

  it('paints woods darker than other land cover', () => {
    expect(landLayers(LIGHT)[4]).toHaveProperty(['paint', 'fill-color'], LIGHT.wood);
  });

  it('keeps woods out of the other land cover', () => {
    expect(landLayers(LIGHT)[3]).toHaveProperty('filter', [
      'match',
      ['get', 'class'],
      ['grass', 'farmland', 'wetland'],
      true,
      false
    ]);
  });

  it('draws only woods in their own layer', () => {
    expect(landLayers(LIGHT)[4]).toHaveProperty('filter', ['match', ['get', 'class'], ['wood'], true, false]);
  });
});

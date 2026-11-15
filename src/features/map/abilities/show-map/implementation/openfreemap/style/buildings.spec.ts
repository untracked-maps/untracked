import { describe, expect, it } from 'vitest';
import { buildingLayers } from './buildings';
import { basemapPalettes } from './colours';

const LIGHT = basemapPalettes.light;

describe('building layers', () => {
  it('fills buildings before outlining them', () => {
    expect(buildingLayers(LIGHT).map(({ id }) => id)).toStrictEqual(['building', 'building-edge']);
  });

  it('shows buildings from zoom 14', () => {
    expect(buildingLayers(LIGHT)[0]).toHaveProperty('minzoom', 14);
  });

  it('outlines buildings from zoom 16', () => {
    expect(buildingLayers(LIGHT)[1]).toHaveProperty('minzoom', 16);
  });
});

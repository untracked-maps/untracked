import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { waterLayers } from './water';

const LIGHT = basemapPalettes.light;

describe('water layers', () => {
  it('fills water bodies before drawing waterways', () => {
    expect(waterLayers(LIGHT).map(({ id }) => id)).toStrictEqual(['water', 'waterway']);
  });

  it('draws waterways in the water colour', () => {
    expect(waterLayers(LIGHT)[1]).toHaveProperty(['paint', 'line-color'], LIGHT.water);
  });
});

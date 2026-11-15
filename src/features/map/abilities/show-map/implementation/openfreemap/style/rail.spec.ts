import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { railLayers } from './rail';

const LIGHT = basemapPalettes.light;

describe('rail layers', () => {
  it('draws railways from zoom 12', () => {
    expect(railLayers(LIGHT)[0]).toHaveProperty('minzoom', 12);
  });
});

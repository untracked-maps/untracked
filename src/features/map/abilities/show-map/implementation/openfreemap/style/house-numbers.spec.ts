import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { houseNumberLayers } from './house-numbers';

const LIGHT = basemapPalettes.light;

describe('house number layers', () => {
  it('shows house numbers from zoom 18', () => {
    expect(houseNumberLayers(LIGHT)[0]).toHaveProperty('minzoom', 18);
  });
});

import { describe, expect, it } from 'vitest';
import { houseNumberLayers } from './house-numbers';

describe('house number layers', () => {
  it('shows house numbers from zoom 18', () => {
    expect(houseNumberLayers[0]).toHaveProperty('minzoom', 18);
  });
});

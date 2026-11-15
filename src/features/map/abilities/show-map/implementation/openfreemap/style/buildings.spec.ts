import { describe, expect, it } from 'vitest';
import { buildingLayers } from './buildings';

describe('building layers', () => {
  it('fills buildings before outlining them', () => {
    expect(buildingLayers.map(({ id }) => id)).toStrictEqual(['building', 'building-edge']);
  });

  it('shows buildings from zoom 14', () => {
    expect(buildingLayers[0]).toHaveProperty('minzoom', 14);
  });

  it('outlines buildings from zoom 16', () => {
    expect(buildingLayers[1]).toHaveProperty('minzoom', 16);
  });
});

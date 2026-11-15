import { describe, expect, it } from 'vitest';
import { colours } from './colours';
import { waterLayers } from './water';

describe('water layers', () => {
  it('fills water bodies before drawing waterways', () => {
    expect(waterLayers.map(({ id }) => id)).toStrictEqual(['water', 'waterway']);
  });

  it('draws waterways in the water colour', () => {
    expect(waterLayers[1]).toHaveProperty(['paint', 'line-color'], colours.water);
  });
});

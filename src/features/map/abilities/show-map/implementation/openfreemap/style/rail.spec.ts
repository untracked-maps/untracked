import { describe, expect, it } from 'vitest';
import { railLayers } from './rail';

describe('rail layers', () => {
  it('draws railways from zoom 12', () => {
    expect(railLayers[0]).toHaveProperty('minzoom', 12);
  });
});

import { describe, expect, it } from 'vitest';
import { fonts } from './fonts';
import { roadNameLayers } from './road-names';

describe('road name layers', () => {
  it('names major roads before naming every road', () => {
    expect(roadNameLayers.map(({ id }) => id)).toStrictEqual(['road-name-major', 'road-name']);
  });

  it('hands major road names over to every road name at zoom 14', () => {
    expect(roadNameLayers[0]).toHaveProperty('maxzoom', 14);
  });

  it('writes road names in capitals', () => {
    expect(roadNameLayers[1]).toHaveProperty(['layout', 'text-transform'], 'uppercase');
  });

  it('writes road names in Inter Medium', () => {
    expect(roadNameLayers[1]).toHaveProperty(['layout', 'text-font'], fonts.medium);
  });
});

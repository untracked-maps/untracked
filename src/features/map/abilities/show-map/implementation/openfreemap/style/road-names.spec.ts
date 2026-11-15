import { describe, expect, it } from 'vitest';
import { basemapPalettes } from './colours';
import { fonts } from './fonts';
import { roadNameLayers } from './road-names';

const LIGHT = basemapPalettes.light;

describe('road name layers', () => {
  it('names major roads before naming every road', () => {
    expect(roadNameLayers(LIGHT).map(({ id }) => id)).toStrictEqual(['road-name-major', 'road-name']);
  });

  it('hands major road names over to every road name at zoom 14', () => {
    expect(roadNameLayers(LIGHT)[0]).toHaveProperty('maxzoom', 14);
  });

  it('writes road names in capitals', () => {
    expect(roadNameLayers(LIGHT)[1]).toHaveProperty(['layout', 'text-transform'], 'uppercase');
  });

  it('writes road names in Inter Medium', () => {
    expect(roadNameLayers(LIGHT)[1]).toHaveProperty(['layout', 'text-font'], fonts.medium);
  });
});

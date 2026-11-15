import { describe, expect, it } from 'vitest';
import { fonts } from './fonts';
import { placeLayers } from './places';

describe('place layers', () => {
  it('names neighbourhoods, towns then cities', () => {
    expect(placeLayers.map(({ id }) => id)).toStrictEqual(['place-small', 'place-town', 'place-city']);
  });

  it('writes city names in Inter Bold', () => {
    expect(placeLayers[2]).toHaveProperty(['layout', 'text-font'], fonts.bold);
  });

  it('places bigger cities first', () => {
    expect(placeLayers[1]).toHaveProperty(['layout', 'symbol-sort-key'], ['coalesce', ['get', 'rank'], 99]);
  });

  it('enlarges capitals and the biggest cities', () => {
    expect(placeLayers[2]).toHaveProperty(
      ['layout', 'text-size', 4],
      ['case', ['any', ['==', ['get', 'capital'], 2], ['<=', ['coalesce', ['get', 'rank'], 99], 3]], 13, 11]
    );
  });

  it('centres town names on their place from zoom 9.5', () => {
    expect(placeLayers[1]).toHaveProperty(['layout', 'text-anchor'], ['step', ['zoom'], 'left', 9.5, 'center']);
  });
});

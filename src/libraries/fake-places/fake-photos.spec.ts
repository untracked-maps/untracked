import { describe, expect, it } from 'vitest';
import { PHOTO_FILES, photosByHand } from './fake-photos';

const LAST_IS_FIRST = /;photos\/cafe-01\.svg$/u;

describe('the fake photo files', () => {
  it('give twelve shades to each family and to places without one', () => {
    expect(PHOTO_FILES).toHaveLength(168);
  });

  it('are named after the family and the shade', () => {
    expect(PHOTO_FILES.slice(0, 2)).toEqual(['food-01.svg', 'food-02.svg']);
  });

  it('end with the twelfth shade of places without a family', () => {
    expect(PHOTO_FILES.at(-1)).toBe('none-12.svg');
  });
});

describe('the photos of a place chosen by hand', () => {
  it('are the first shades of its family, in order', () => {
    expect(photosByHand('museum', 3)).toEqual({
      image: 'photos/culture-01.svg;photos/culture-02.svg;photos/culture-03.svg'
    });
  });

  it('are those of places without a family when its kind has none', () => {
    expect(photosByHand('parking', 1)).toEqual({ image: 'photos/none-01.svg' });
  });

  it('start again from the first shade past the twelfth', () => {
    expect(photosByHand('cafe', 13)['image']).toMatch(LAST_IS_FIRST);
  });
});

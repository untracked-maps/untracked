import { describe, expect, it } from 'vitest';
import { fakePhotoImage, photoFileOf } from './fake-photo-image';

const CLOSED = /\/><\/svg>$/u;

const SIZED = /^<svg [^>]*viewBox="0 0 800 600" width="800" height="600">/u;

const DRAWING = { colour: '#808080', pictogram: 'M0 0h32v32H0z' };

describe('the file of a fake photo', () => {
  it('names a family and a shade', () => {
    expect(photoFileOf('culture-07.svg')).toEqual({ family: 'culture', shade: 7 });
  });

  it('names the photos of places without a family', () => {
    expect(photoFileOf('none-12.svg')).toEqual({ family: 'none', shade: 12 });
  });

  it.each([
    ['an unknown family', 'castle-01.svg'],
    ['a shade past the twelfth', 'culture-13.svg'],
    ['another kind of image', 'culture-01.png'],
    ['a name with something before it', 'x-culture-01.svg']
  ])('is not one with %s', (_, file) => {
    expect(photoFileOf(file)).toBeUndefined();
  });
});

describe('the shade of a fake photo', () => {
  it('darkens the colour of the family at first', () => {
    expect(fakePhotoImage(DRAWING, 1)).toContain('fill="#5a5a5a"');
  });

  it('lightens it at last', () => {
    expect(fakePhotoImage(DRAWING, 12)).toContain('fill="#a6a6a6"');
  });

  it('goes from dark to light through the twelve shades', () => {
    expect(fakePhotoImage(DRAWING, 4)).toContain('fill="#6f6f6f"');
  });

  it('darkens each channel apart', () => {
    expect(fakePhotoImage({ ...DRAWING, colour: '#ff0080' }, 1)).toContain('#b3005a');
  });

  it('writes each channel with two digits', () => {
    expect(fakePhotoImage({ ...DRAWING, colour: '#000000' }, 1)).toContain('fill="#000000"');
  });

  it('keeps each channel apart', () => {
    expect(fakePhotoImage({ ...DRAWING, colour: '#ff0080' }, 12)).toContain('fill="#ff4da6"');
  });
});

describe('a fake photo', () => {
  it('is an image of 800 by 600', () => {
    expect(fakePhotoImage(DRAWING, 12)).toMatch(SIZED);
  });

  it('is filled with the shade of the colour of its family', () => {
    expect(fakePhotoImage(DRAWING, 12)).toContain('<rect width="800" height="600" fill="#a6a6a6"/>');
  });

  it('draws the pictogram of its family in white', () => {
    expect(fakePhotoImage(DRAWING, 12)).toContain('<path d="M0 0h32v32H0z" fill="#ffffff" fill-opacity="0.92"');
  });

  it('ends with the pictogram', () => {
    expect(fakePhotoImage(DRAWING, 12)).toMatch(CLOSED);
  });

  it('draws the pictogram 240 pixels wide, in the middle', () => {
    expect(fakePhotoImage(DRAWING, 12)).toContain('translate(280 180) scale(7.5)');
  });
});

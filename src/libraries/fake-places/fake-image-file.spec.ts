import { describe, expect, it } from 'vitest';
import { FAKE_IMAGE_ENTRIES, fakeImageFile } from './fake-image-file';

const DRAWINGS = { culture: { colour: '#808080', pictogram: 'M0 0h32v32H0z' } };

const drawn = (drawing: { readonly colour: string }, shade: number): string => `<svg>${drawing.colour} ${shade}</svg>`;

const fileOf = fakeImageFile(drawn, (family) => ({ ...DRAWINGS.culture, colour: family }));

describe('the file of a fake image', () => {
  it('is drawn for the family and the shade it names', async () => {
    expect(await fileOf('culture-07.svg').text()).toBe('<svg>culture 7</svg>');
  });

  it('is an SVG image', () => {
    expect(fileOf('culture-07.svg').headers.get('content-type')).toBe('image/svg+xml');
  });

  it('is not found for a name it does not know', () => {
    expect(fileOf('castle-01.svg').status).toBe(404);
  });

  it('is one of 168, one for each family and shade', () => {
    expect(FAKE_IMAGE_ENTRIES).toHaveLength(168);
  });

  it('is first that of the first shade of food', () => {
    expect(FAKE_IMAGE_ENTRIES[0]).toEqual({ file: 'food-01.svg' });
  });
});

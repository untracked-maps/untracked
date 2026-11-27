import { on } from 'svelte/events';
import { describe, expect, it } from 'vitest';
import { photoLoaded } from './photo-loaded';

const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"/>')}`;

const imageOf = async (source: string): Promise<HTMLImageElement> => {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
};

const loadedOnce = (image: HTMLImageElement): Promise<void> =>
  new Promise((resolve) => {
    on(image, 'load', () => resolve());
  });

describe('a photo loaded', () => {
  it('is marked when it was loaded before', async () => {
    const image = await imageOf(IMAGE);
    photoLoaded(image);

    expect(image.hasAttribute('data-loaded')).toBe(true);
  });

  it('is marked once it loads', async () => {
    const image = new Image();
    photoLoaded(image);
    const loading = loadedOnce(image);
    image.src = IMAGE;
    await loading;

    expect(image.hasAttribute('data-loaded')).toBe(true);
  });

  it('is not marked before it loads', () => {
    const image = new Image();
    photoLoaded(image);

    expect(image.hasAttribute('data-loaded')).toBe(false);
  });

  it('is no longer watched once the card is gone', async () => {
    const image = new Image();
    photoLoaded(image)();
    const loading = loadedOnce(image);
    image.src = IMAGE;
    await loading;

    expect(image.hasAttribute('data-loaded')).toBe(false);
  });
});

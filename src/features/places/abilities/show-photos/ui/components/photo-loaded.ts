import { on } from 'svelte/events';

const marked = (image: HTMLImageElement): void => {
  image.toggleAttribute('data-loaded', true);
};

const photoLoaded = (image: HTMLImageElement): (() => void) => {
  const mark = (): void => marked(image);
  if (image.complete && image.naturalWidth > 0) {
    mark();
  }
  return on(image, 'load', mark);
};

export { photoLoaded };

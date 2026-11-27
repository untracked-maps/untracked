import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { commands, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Photos } from '../../domain/show-photos';
import PhotoStrip from './photo-strip.svelte';

const NAME = 'Café de Flore';

const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"/>')}`;

const THREE: Photos = ['photos/cafe-01.svg', 'photos/cafe-02.svg', 'photos/cafe-03.svg'];

const loading = (): string => 'photos/never-there.svg';

const loaded = (): string => IMAGE;

const shown = async (photos: Photos, source: (path: string) => string = loaded): Promise<HTMLElement> => {
  await page.viewport(390, 844);
  return (await render(PhotoStrip, { photos: of(photos), name: NAME, source })).container;
};

const cardNamed = (name: string): Element => page.getByRole('button', { name }).element();

const ratioOf = (element: Element): number => {
  const { width, height } = element.getBoundingClientRect();
  return height / width;
};

describe('the photo strip of a place', () => {
  it('shows a card for each photo', async () => {
    await shown(THREE);

    expect(
      page
        .getByRole('list', { name: `Photos of ${NAME}` })
        .getByRole('listitem')
        .elements()
    ).toHaveLength(3);
  });

  it('names each card after its place and its rank', async () => {
    await shown(THREE);

    await expect.element(page.getByRole('button', { name: `Photo 2 of 3 of ${NAME}` })).toBeVisible();
  });

  it('is absent when the place has no photo', async () => {
    expect((await shown([])).querySelector('ul')).toBeNull();
  });

  it('makes a card a little higher than wide', async () => {
    await shown(THREE);

    expect(ratioOf(cardNamed(`Photo 1 of 3 of ${NAME}`))).toBeCloseTo(1.1, 2);
  });

  it('shows 2.15 cards in its width', async () => {
    await shown(THREE);
    const strip = page.getByRole('list').element().getBoundingClientRect().width - 32;

    expect(cardNamed(`Photo 1 of 3 of ${NAME}`).getBoundingClientRect().width).toBeCloseTo((strip - 8) / 2.15, 1);
  });

  it('shows a single photo across its width, 16 by 10', async () => {
    await shown(['photos/cafe-01.svg']);

    expect(ratioOf(cardNamed(`Photo 1 of 1 of ${NAME}`))).toBeCloseTo(0.625, 2);
  });
});

describe('a card of the photo strip', () => {
  it('rounds the corners of a card by 18 px', async () => {
    await shown(THREE);

    expect(getComputedStyle(cardNamed(`Photo 1 of 3 of ${NAME}`)).borderRadius).toBe('18px');
  });

  it('writes no source on a card', async () => {
    await shown(THREE);

    expect(cardNamed(`Photo 1 of 3 of ${NAME}`).textContent.trim()).toBe('');
  });

  it('lets the sheet stay still when it scrolls sideways', async () => {
    await shown(THREE);

    expect(page.getByRole('list').element().hasAttribute('data-sheet-sideways')).toBe(true);
  });

  it('breathes while a photo loads', async () => {
    await shown(THREE, loading);

    expect(getComputedStyle(cardNamed(`Photo 1 of 3 of ${NAME}`)).animationName).toContain('breathe');
  });

  it('does not breathe when motion is reduced', async () => {
    await commands.reduceMotion(true);
    await shown(THREE, loading);

    expect(getComputedStyle(cardNamed(`Photo 1 of 3 of ${NAME}`)).animationName).toBe('none');
  });

  it('fades a photo in once loaded', async () => {
    await shown(THREE);

    await expect
      .poll(() => getComputedStyle(cardNamed(`Photo 1 of 3 of ${NAME}`).querySelector('img') ?? document.body).opacity)
      .toBe('1');
  });

  it('opens the photos in full screen when a card is touched', async () => {
    await shown(THREE);
    await page.getByRole('button', { name: `Photo 2 of 3 of ${NAME}` }).click();

    await expect.element(page.getByRole('dialog', { name: `Photos of ${NAME}` })).toBeVisible();
  });
});

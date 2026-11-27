import { of, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { commands, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { type Closable, NEVER_ASKED } from '#libraries/design/closable';
import PhotoStrip from './photo-strip.svelte';

const NAME = 'Café de Flore';

const IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"/>')}`;

const viewer = (): Element => page.getByRole('dialog').element();

const openedAt = async (rank: number, closable: Closable = NEVER_ASKED): Promise<void> => {
  await page.viewport(390, 844);
  await render(PhotoStrip, {
    photos: of(['photos/cafe-01.svg', 'photos/cafe-02.svg', 'photos/cafe-03.svg']),
    name: NAME,
    source: () => IMAGE,
    closable
  });
  await page.getByRole('button', { name: `Photo ${rank} of 3 of ${NAME}` }).click();
  await expect.element(page.getByRole('dialog')).toBeVisible();
};

describe('the full-screen photos of a place', () => {
  it('count the photo shown', async () => {
    await openedAt(2);

    await expect.element(page.getByText('2 / 3')).toBeVisible();
  });

  it('show the photo touched', async () => {
    await openedAt(3);

    await expect.element(page.getByRole('img', { name: `Photo 3 of 3 of ${NAME}` })).toBeInViewport();
  });

  it('credit every photo as a sample', async () => {
    await openedAt(1);

    await expect.element(page.getByText('Sample image')).toBeVisible();
  });

  it('are on black', async () => {
    await openedAt(1);

    expect(getComputedStyle(viewer()).backgroundColor).toBe('rgb(0, 0, 0)');
  });

  it('close with their round button', async () => {
    await openedAt(1);
    await page.getByRole('button', { name: 'Close' }).click();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('close when asked to', async () => {
    const closings = new Subject<void>();
    await openedAt(1, { ...NEVER_ASKED, closings });
    closings.next();

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('tell when they open', async () => {
    const toggles: boolean[] = [];
    await openedAt(1, {
      ...NEVER_ASKED,
      onToggle: (open): void => {
        toggles.push(open);
      }
    });

    expect(toggles).toEqual([true]);
  });
});

describe('going from photo to photo', () => {
  it.each([
    ['Previous photo', 1],
    ['Next photo', 3]
  ] as const)('offers no %s past the end', async (name, rank) => {
    await openedAt(rank);

    await expect.element(page.getByRole('button', { name })).not.toBeInTheDocument();
  });

  it.each([
    ['Next photo', 1, '2 / 3'],
    ['Previous photo', 3, '2 / 3']
  ] as const)('goes on with the button %s', async (name, rank, count) => {
    await openedAt(rank);
    await page.getByRole('button', { name }).click();

    await expect.element(page.getByText(count)).toBeVisible();
  });

  it.each([
    ['{ArrowRight}', 1, '2 / 3'],
    ['{ArrowRight}', 3, '3 / 3'],
    ['{ArrowLeft}', 2, '1 / 3'],
    ['a', 2, '2 / 3']
  ] as const)('follows the key %s from photo %i', async (key, rank, count) => {
    await openedAt(rank);
    await userEvent.keyboard(key);

    await expect.element(page.getByText(count)).toBeVisible();
  });

  it('jumps to the next photo', async () => {
    await commands.reduceMotion(true);
    await openedAt(1);
    await page.getByRole('button', { name: 'Next photo' }).click();

    await expect.element(page.getByText('2 / 3')).toBeVisible();
  });
});

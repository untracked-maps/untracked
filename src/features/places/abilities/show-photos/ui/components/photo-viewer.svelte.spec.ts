import { of, Subject } from 'rxjs';
import { on } from 'svelte/events';
import { describe, expect, it } from 'vitest';
import { commands, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { type Closable, NEVER_ASKED } from '#libraries/design/closable';
import PhotoStrip from './photo-strip.svelte';

type At = readonly [x: number, y: number];

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

const finger = (type: string, ...points: readonly At[]): boolean => {
  const target = viewer();
  const touches = points.map(([clientX, clientY], identifier) => new Touch({ identifier, target, clientX, clientY }));
  return target.dispatchEvent(new TouchEvent(type, { bubbles: true, touches }));
};

const fingered = (...steps: readonly (readonly [string, ...At[]])[]): readonly boolean[] =>
  steps.map(([type, ...points]) => finger(type, ...points));

const drawn = (property: string): string => getComputedStyle(viewer()).getPropertyValue(property);

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

describe('touching the full-screen photos', () => {
  it('closes them when swiped down past 110 px', async () => {
    await openedAt(1);
    fingered(['touchstart', [200, 300]], ['touchmove', [200, 320]], ['touchmove', [200, 450]], ['touchend']);

    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    [
      'fades the photo swiped down',
      '--fade',
      '0.5',
      [
        ['touchstart', [200, 300]],
        ['touchmove', [200, 550]]
      ]
    ],
    ['zooms a photo touched twice', '--zoom', '2.5', [['touchstart', [200, 300]], ['touchend'], ['touchstart', [200, 300]]]],
    [
      'zooms a photo pinched',
      '--zoom',
      '2',
      [
        ['touchstart', [150, 300], [250, 300]],
        ['touchmove', [100, 300], [300, 300]]
      ]
    ],
    [
      'moves a zoomed photo with the finger',
      '--pan-x',
      '-20px',
      [
        ['touchstart', [150, 300], [250, 300]],
        ['touchmove', [100, 300], [300, 300]],
        ['touchend', [300, 300]],
        ['touchmove', [280, 300]]
      ]
    ]
  ] as const)('%s', async (_, property, value, steps) => {
    await openedAt(1);
    fingered(...steps);

    await expect.poll(() => drawn(property)).toBe(value);
  });

  it('forgets the zoom when closed', async () => {
    await openedAt(1);
    fingered(['touchstart', [150, 300], [250, 300]], ['touchmove', [100, 300], [300, 300]]);
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: `Photo 1 of 3 of ${NAME}` }).click();

    await expect.poll(() => drawn('--zoom')).toBe('1');
  });

  it('keeps its touches from the sheet below', async () => {
    const reached: string[] = [];
    await openedAt(1);
    on(document.body, 'touchstart', () => {
      reached.push('body');
    });
    finger('touchstart', [200, 300]);

    expect(reached).toEqual([]);
  });
});

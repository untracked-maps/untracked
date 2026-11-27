import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PhotoViewer from './photo-viewer.svelte';

type At = readonly [x: number, y: number];

const PICTURE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"/>')}`;

const dialog = (): Element => page.getByRole('dialog').element();

const viewerShown = async (): Promise<Subject<number>> => {
  const opening = new Subject<number>();
  await page.viewport(412, 915);
  await render(PhotoViewer, {
    photos: ['photos/sight-01.svg', 'photos/sight-02.svg'],
    name: 'Musée Rodin',
    source: () => PICTURE,
    opening
  });
  opening.next(0);
  await expect.element(page.getByRole('dialog', { name: 'Photos of Musée Rodin' })).toBeVisible();
  return opening;
};

const finger = (type: string, ...points: readonly At[]): boolean => {
  const target = dialog();
  const touches = points.map(([clientX, clientY], identifier) => new Touch({ identifier, target, clientX, clientY }));
  return target.dispatchEvent(new TouchEvent(type, { bubbles: true, touches }));
};

const fingered = (...steps: readonly (readonly [string, ...At[]])[]): readonly boolean[] =>
  steps.map(([type, ...points]) => finger(type, ...points));

const drawn = (property: string): string => getComputedStyle(dialog()).getPropertyValue(property);

const currentPhoto = (): Element => dialog().querySelector('.current img') ?? document.body;

describe('touching the full-screen photos', () => {
  it('closes them when swiped down past 110 px', async () => {
    await viewerShown();
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
    await viewerShown();
    fingered(...steps);

    await expect.poll(() => drawn(property)).toBe(value);
  });

  it('moves the photo at once while it is swiped down', async () => {
    await viewerShown();
    fingered(['touchstart', [200, 300]], ['touchmove', [200, 400]]);

    await expect.poll(() => getComputedStyle(currentPhoto()).transitionDuration).toBe('0s');
  });

  it('keeps a zoomed photo from scrolling', async () => {
    await viewerShown();
    fingered(['touchstart', [150, 300], [250, 300]], ['touchmove', [100, 300], [300, 300]]);

    await expect.poll(() => getComputedStyle(dialog().querySelector('.track') ?? document.body).touchAction).toBe('none');
  });

  it('forgets the zoom of a photo left', async () => {
    await viewerShown();
    fingered(['touchstart', [150, 300], [250, 300]], ['touchmove', [100, 300], [300, 300]], ['touchend']);
    await page.getByRole('button', { name: 'Next photo' }).click();

    await expect.poll(() => drawn('--zoom')).toBe('1');
  });

  it('forgets the zoom when closed', async () => {
    const opening = await viewerShown();
    fingered(['touchstart', [150, 300], [250, 300]], ['touchmove', [100, 300], [300, 300]]);
    await page.getByRole('button', { name: 'Close' }).click();
    opening.next(0);

    await expect.poll(() => drawn('--zoom')).toBe('1');
  });

  it.each(['touchstart', 'touchmove', 'touchend', 'touchcancel'])('keeps a %s from the sheet below', async (type) => {
    const reached: string[] = [];
    await viewerShown();
    Reflect.set(document.body, `on${type}`, () => {
      reached.push(type);
    });
    finger(type, [200, 300]);
    Reflect.set(document.body, `on${type}`, null);

    expect(reached).toEqual([]);
  });
});

describe('the keys of the full-screen photos', () => {
  it('keep the arrows for themselves', async () => {
    await viewerShown();
    const key = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    dialog().dispatchEvent(key);

    expect(key.defaultPrevented).toBe(true);
  });

  it('leave the other keys alone', async () => {
    await viewerShown();
    const key = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    dialog().dispatchEvent(key);

    expect(key.defaultPrevented).toBe(false);
  });
});

import { type ComponentProps, createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BottomSheet from './bottom-sheet.svelte';

type SheetProps = Partial<ComponentProps<typeof BottomSheet>>;

const sheetElement = (): HTMLElement | null => document.querySelector<HTMLElement>('.sheet');

const children = createRawSnippet(() => ({ render: (): string => `<div style="block-size: ${5 * 400}px">Details</div>` }));

const scroller = (): Element => document.querySelector('.scroller') ?? document.body;

const swipeDown = (by: number): void => {
  const touchAt = (clientY: number): Touch => new Touch({ identifier: 0, target: scroller(), clientX: 100, clientY });
  scroller().dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touchAt(700)] }));
  scroller().dispatchEvent(new TouchEvent('touchmove', { bubbles: true, touches: [touchAt(700 + by)] }));
  scroller().dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
};

const pause = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 200);
  });

type Seen = {
  readonly heights: number[];
  readonly closes: string[];
  readonly unmount: () => Promise<void>;
  readonly rerender: (props: SheetProps) => Promise<void>;
};

const shown = async (props: SheetProps = {}, width = 390): Promise<Seen> => {
  const heights: number[] = [];
  const closes: string[] = [];
  await page.viewport(width, 844);
  const { unmount, rerender } = await render(BottomSheet, {
    growLabel: 'Enlarge the sheet',
    reduceLabel: 'Reduce the sheet',
    children,
    onHeight: (height: number): void => {
      heights.push(height);
    },
    ...props
  });
  return { heights, closes, unmount, rerender };
};

const tall = (blockSize: string): Promise<void> => expect.element(sheetElement()).toHaveStyle({ blockSize });

const closable = async (): Promise<Seen> => {
  const closes: string[] = [];
  const onClose = (): void => {
    closes.push('closed');
  };
  const seen = await shown({ opening: 'peek', onClose });
  await tall('150px');
  return { ...seen, closes };
};

describe('a bottom sheet that can be closed', () => {
  it('closes once swiped down under its peek', async () => {
    const { closes } = await closable();
    swipeDown(60);

    await expect.poll(() => closes).toEqual(['closed']);
  });

  it('shrinks to nothing in 200 ms as it closes', async () => {
    await closable();
    swipeDown(60);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '0px', transitionDuration: '0.2s' });
  });

  it('stays open after a swipe up', async () => {
    const { closes } = await closable();
    swipeDown(-60);
    await tall('388px');

    expect(closes).toEqual([]);
  });
});

describe('a bottom sheet that cannot be closed', () => {
  it('goes back to its peek once swiped down', async () => {
    await shown({ opening: 'peek' });
    await tall('150px');
    swipeDown(60);
    await pause();

    expect(sheetElement()?.getBoundingClientRect().height).toBe(150);
  });
});

describe('the height a bottom sheet tells', () => {
  it('is the one it shows on a phone', async () => {
    const { heights } = await shown();

    await expect.poll(() => heights.at(-1)).toBe(388);
  });

  it('is none on a large screen, where nothing floats above it', async () => {
    const { heights } = await shown({}, 1280);
    await page.getByText('Details').click();

    expect(heights.filter((height) => height > 0)).toEqual([]);
  });

  it('is none while another sheet covers it', async () => {
    const { heights } = await shown({ covered: true });
    await pause();

    expect(heights.filter((height) => height > 0)).toEqual([]);
  });

  it('is none once the sheet is gone', async () => {
    const { heights, unmount } = await shown();
    await tall('388px');
    await unmount();

    expect(heights.at(-1)).toBe(0);
  });
});

describe('a bottom sheet', () => {
  it('casts a shadow on the map', async () => {
    await shown();
    await tall('388px');

    expect(getComputedStyle(sheetElement() ?? document.body).boxShadow).not.toBe('none');
  });

  it('casts no shadow once it has closed', async () => {
    await closable();
    swipeDown(60);
    await pause();

    expect(getComputedStyle(sheetElement() ?? document.body).boxShadow).toBe('none');
  });

  it('is hidden while another sheet covers it', async () => {
    await shown({ covered: true });

    await expect.element(sheetElement()).toHaveStyle({ visibility: 'hidden' });
  });

  it('goes back to its opening height when its subject changes', async () => {
    const { rerender } = await shown({ subject: 'Louvre' });
    await page.getByRole('button', { name: 'Enlarge the sheet' }).click();
    await rerender({ subject: 'Orsay' });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '388px' });
  });

  it('follows its content when it grows or shrinks', async () => {
    await shown();
    await tall('388px');
    page.getByText('Details').element().setAttribute('style', 'block-size: 100px');

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '130px' });
  });

  it('follows the screen when it is resized', async () => {
    await shown();
    await tall('388px');
    await page.viewport(390, 600);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '276px' });
  });
});

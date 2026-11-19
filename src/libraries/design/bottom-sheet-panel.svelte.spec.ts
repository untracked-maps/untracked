import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BottomSheet from './bottom-sheet.svelte';

type Shown = {
  readonly height: number;
  readonly covered?: boolean;
};

const sheetElement = (): HTMLElement | null => document.querySelector<HTMLElement>('.sheet');

const onLargeScreen = async ({ height, ...props }: Shown, width = 1280): Promise<void> => {
  await page.viewport(width, 800);
  await render(BottomSheet, {
    growLabel: 'Enlarge the sheet',
    reduceLabel: 'Reduce the sheet',
    children: createRawSnippet(() => ({ render: (): string => `<div style="block-size: ${height}px">Details</div>` })),
    ...props
  });
};

describe('a bottom sheet on a large screen', () => {
  it('is a panel fixed on the left, 16 px from the edge and under the search field', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(sheetElement()).toHaveStyle({ position: 'fixed', left: '16px', top: '80px' });
  });

  it('is 400 px wide at most', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(sheetElement()).toHaveStyle({ inlineSize: '400px' });
  });

  it('keeps to 58 % of a narrower screen, less 16 px', async () => {
    await onLargeScreen({ height: 2000 }, 700);

    await expect.element(sheetElement()).toHaveStyle({ inlineSize: '390px' });
  });

  it('stops 16 px above the bottom of the screen and scrolls', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '704px', overflowY: 'auto' });
  });

  it('is no taller than its content', async () => {
    await onLargeScreen({ height: 200 });

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '200px' });
  });

  it('rounds its corners by 20 px', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(sheetElement()).toHaveStyle({ borderRadius: '20px' });
  });

  it('has no grip', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(page.getByRole('button')).not.toBeInTheDocument();
  });

  it('is also the look of a phone held sideways', async () => {
    await onLargeScreen({ height: 2000 }, 844);
    await page.viewport(844, 390);

    await expect.element(sheetElement()).toHaveStyle({ top: '80px' });
  });
});

describe('a panel that is not open', () => {
  it('takes no room while another one covers it', async () => {
    await onLargeScreen({ height: 2000, covered: true });

    await expect.element(sheetElement()).toHaveStyle({ display: 'none' });
  });

  it('shows once open and uncovered', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(sheetElement()).toHaveStyle({ display: 'block' });
  });

  it('tells the page it is open, so that nothing stays under it', async () => {
    await onLargeScreen({ height: 2000 });

    await expect.element(sheetElement()).toHaveAttribute('data-sheet-open', 'true');
  });

  it('does not tell the page it is open while another one covers it', async () => {
    await onLargeScreen({ height: 2000, covered: true });

    await expect.element(sheetElement()).not.toHaveAttribute('data-sheet-open');
  });
});

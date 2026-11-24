import { createRawSnippet } from 'svelte';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BottomSheet from './bottom-sheet.svelte';

const content = (height: number): ReturnType<typeof createRawSnippet> =>
  createRawSnippet(() => ({ render: (): string => `<div style="block-size: ${height}px">Details</div>` }));

const sheetElement = (): HTMLElement | null => page.getByText('Details').element().closest<HTMLElement>('.sheet');

const barEndingAt = (bottom: number): void => {
  const bar = document.createElement('div');
  bar.setAttribute('data-notice-under', '');
  bar.setAttribute('style', `position: fixed; inset: 0 0 auto; block-size: ${bottom}px`);
  document.body.append(bar);
  onTestFinished(() => bar.remove());
};

const fullOnPhone = async (height: number): Promise<void> => {
  await page.viewport(390, 640);
  await render(BottomSheet, {
    growLabel: 'Enlarge the sheet',
    reduceLabel: 'Reduce the sheet',
    opening: 'full',
    children: content(height)
  });
};

describe('a bottom sheet beside the room of a notice', () => {
  it('rises to 80 px of the top rather than stop in the room of a notice under the bar', async () => {
    barEndingAt(104);
    await fullOnPhone(432);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '560px' });
  });

  it('stops at its content when that leaves the room of a notice free', async () => {
    barEndingAt(104);
    await fullOnPhone(430);

    await expect.element(sheetElement()).toHaveStyle({ blockSize: '460px' });
  });
});

import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import BottomSheet from './bottom-sheet.svelte';

const content = createRawSnippet(() => ({
  render: (): string => '<div><p>Opening hours</p><dialog><p>Photo 1 of 3</p></dialog></div>'
}));

const swiped = (from: Element, fromY: number, toY: number): void => {
  const at = (clientY: number): Touch => new Touch({ identifier: 0, target: from, clientX: 120, clientY });
  from.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [at(fromY)] }));
  from.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, touches: [at(toY)] }));
};

const heightAfterSwipeOn = async (text: string): Promise<'still' | 'moved'> => {
  await page.viewport(390, 844);
  await render(BottomSheet, { growLabel: 'Grow', reduceLabel: 'Reduce', children: content });
  const sheet = page.getByText('Opening hours').element().closest<HTMLElement>('.sheet') ?? document.body;
  await expect.poll(() => sheet.style.getPropertyValue('--sheet-height')).not.toBe('');
  const before = sheet.style.getPropertyValue('--sheet-height');
  swiped(page.getByText(text).element(), 500, 380);
  await new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
  return before === sheet.style.getPropertyValue('--sheet-height') ? 'still' : 'moved';
};

describe('a bottom sheet under a window', () => {
  it('moves with a finger on its content', async () => {
    expect(await heightAfterSwipeOn('Opening hours')).toBe('moved');
  });

  it('stays still under a finger on a window opened from it', async () => {
    expect(await heightAfterSwipeOn('Photo 1 of 3')).toBe('still');
  });
});

import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogButton from './dialog-button.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<p>Credits</p>' }));

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const aboutWindow = page.getByRole('dialog');

const credits = (): Element => page.getByText('Credits').element();

const touch = (type: string, ...ys: readonly number[]): void => {
  const target = credits();
  const touches = ys.map((clientY) => new Touch({ identifier: 1, target, clientX: 50, clientY }));
  target.dispatchEvent(new TouchEvent(type, { bubbles: true, touches }));
};

const shown = async (width: number, height: number): Promise<void> => {
  await page.viewport(width, height);
  await render(DialogButton, { label: 'About', title: 'Untracked Maps', closeLabel: 'Close', icon, children });
  await page.getByRole('button', { name: 'About' }).click();
};

describe('a aboutWindow touched on a phone', () => {
  it('does not move when the touch starts with no finger', async () => {
    await shown(390, 844);
    touch('touchstart');

    touch('touchmove', 400);

    await expect.element(aboutWindow).toHaveStyle({ translate: '0px' });
  });

  it('keeps its place when a move comes with no finger', async () => {
    await shown(390, 844);
    touch('touchstart', 200);
    touch('touchmove', 260);

    touch('touchmove');

    await expect.element(aboutWindow).toHaveStyle({ translate: '0px 60px' });
  });
});

describe('a aboutWindow touched on a large screen', () => {
  it('does not move when swiped down', async () => {
    await shown(1024, 768);
    touch('touchstart', 200);

    touch('touchmove', 260);

    await expect.element(aboutWindow).toHaveStyle({ translate: '0px' });
  });
});

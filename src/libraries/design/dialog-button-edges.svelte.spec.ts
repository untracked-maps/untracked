import { createRawSnippet } from 'svelte';
import { describe, expect, it, onTestFinished } from 'vitest';
import { cdp, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogButton from './dialog-button.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const children = createRawSnippet(() => ({ render: (): string => '<p>Sources</p>' }));

const onPhone = async (): Promise<Element> => {
  await page.viewport(390, 844);
  await render(DialogButton, { label: 'About this map', title: 'Untracked Maps', closeLabel: 'Close', icon, children });
  await page.getByRole('button', { name: 'About this map' }).click();
  return page.getByRole('dialog').element();
};

const withSafeBottom = async (bottom: number): Promise<void> => {
  await cdp().send('Emulation.setSafeAreaInsetsOverride', { insets: { bottom } });
  onTestFinished(async () => {
    await cdp().send('Emulation.setSafeAreaInsetsOverride', { insets: {} });
  });
};

const box = (element: Element): DOMRect => element.getBoundingClientRect();

const title = (): Element => page.getByRole('heading', { name: 'Untracked Maps' }).element();

const handle = (dialog: Element): Element => dialog.querySelector('[data-dialog-handle]') ?? dialog;

describe('the edges of a window on a phone', () => {
  it('show its handle 12 px from its top', async () => {
    const dialog = await onPhone();

    expect(box(handle(dialog)).top - box(dialog).top).toBe(12);
  });

  it('leave 10 px between its handle and its title', async () => {
    const dialog = await onPhone();

    expect(box(title()).top - box(handle(dialog)).bottom).toBe(10);
  });

  it('leave 22 px below its content, on top of the safe area of the screen', async () => {
    await withSafeBottom(34);
    const dialog = await onPhone();

    expect(getComputedStyle(dialog).paddingBottom).toBe('56px');
  });
});

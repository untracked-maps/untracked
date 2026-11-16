import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import IconButton from './icon-button.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

describe('icon button', () => {
  it('is named by its label', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Show my position' })).toBeVisible();
  });

  it('does its action once pressed', async () => {
    const presses: string[] = [];
    await render(IconButton, {
      children,
      label: 'Show my position',
      onclick: (): void => {
        presses.push('pressed');
      }
    });

    await page.getByRole('button', { name: 'Show my position' }).click();

    expect(presses).toEqual(['pressed']);
  });

  it('can be pressed by default', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined });

    await expect.element(page.getByRole('button')).toBeEnabled();
  });

  it('cannot be pressed while disabled', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined, disabled: true });

    await expect.element(page.getByRole('button')).toBeDisabled();
  });

  it('draws its icon in the accent colour by default', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined });

    await expect.element(page.getByRole('button')).toHaveStyle({ color: 'rgb(42, 91, 215)' });
  });

  it('draws its icon in the text colour when neutral', async () => {
    await render(IconButton, { children, label: 'Settings', onclick: () => undefined, tone: 'neutral' });

    await expect.element(page.getByRole('button')).toHaveStyle({ color: 'rgb(28, 29, 31)' });
  });
});

describe('icon button that opens a panel', () => {
  it('tells it opens a dialog when it opens one', async () => {
    await render(IconButton, { children, label: 'Settings', opens: 'settings' });

    await expect.element(page.getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('opens no dialog when it does an action', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined });

    await expect.element(page.getByRole('button')).not.toHaveAttribute('aria-haspopup');
  });

  it('gives no command to a dialog when it does an action', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined });

    await expect.element(page.getByRole('button')).not.toHaveAttribute('command');
  });

  it('points to the panel it toggles', async () => {
    await render(IconButton, { children, label: 'Map type', toggles: 'layers' });

    await expect.element(page.getByRole('button')).toHaveAttribute('popovertarget', 'layers');
  });

  it('toggles no panel when it does an action', async () => {
    await render(IconButton, { children, label: 'Show my position', onclick: () => undefined });

    await expect.element(page.getByRole('button')).not.toHaveAttribute('popovertarget');
  });
});

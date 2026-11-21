import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogButton from './dialog-button.svelte';
import PopoverButton from './popover-button.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const theme = createRawSnippet(() => ({ render: (): string => '<p>Theme</p>' }));

const sources = createRawSnippet(() => ({ render: (): string => '<p>Sources</p>' }));

const menuThenWindow = async (): Promise<void> => {
  await render(PopoverButton, { label: 'Map type', icon, children: theme });
  await render(DialogButton, {
    label: 'About this map',
    title: 'Untracked Maps',
    closeLabel: 'Close',
    icon,
    children: sources
  });
  document.querySelector<HTMLButtonElement>('button[aria-label="Map type"]')?.click();
  await expect.element(page.getByText('Theme')).toBeVisible();
  page.getByRole('button', { name: 'About this map' }).element().focus();
  await userEvent.keyboard('{Enter}');
};

describe('a window opened while a menu is open', () => {
  it('closes the menu', async () => {
    await menuThenWindow();

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });

  it('opens', async () => {
    await menuThenWindow();

    await expect.element(page.getByRole('dialog', { name: 'Untracked Maps' })).toBeVisible();
  });
});

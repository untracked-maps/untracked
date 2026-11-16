import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PopoverButton from './popover-button.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const children = createRawSnippet(() => ({ render: (): string => '<p>Theme</p>' }));

const props = { label: 'Map type', icon, children };

const open = async (): Promise<void> => {
  await render(PopoverButton, props);
  await page.getByRole('button', { name: 'Map type' }).click();
};

describe('popover button', () => {
  it('keeps its panel closed at first', async () => {
    await render(PopoverButton, props);

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });

  it('opens a panel named by its label once pressed', async () => {
    await open();

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).toBeVisible();
  });

  it('shows its content in the panel', async () => {
    await open();

    await expect.element(page.getByRole('dialog').getByText('Theme')).toBeVisible();
  });

  it('closes its panel with the Escape key', async () => {
    await open();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });
});

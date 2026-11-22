import { createRawSnippet } from 'svelte';
import { describe, expect, it, onTestFinished } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PopoverButton from './popover-button.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<p>Basemap</p>' }));

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const button = (): Element => page.getByRole('button', { name: 'Map type' }).element();

const opened = async (): Promise<Element> => {
  await render(PopoverButton, { label: 'Map type', icon, children });
  await page.getByRole('button', { name: 'Map type' }).click();
  await expect.element(page.getByText('Basemap')).toBeVisible();
  return button();
};

const inDarkTheme = (): void => {
  document.documentElement.style.colorScheme = 'dark';
  onTestFinished(() => {
    document.documentElement.style.colorScheme = '';
  });
};

describe('the button of an open menu', () => {
  it('takes a pale blue background', async () => {
    const pressed = await opened();

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(232, 238, 252)');
  });

  it('shows its icon in the accent colour', async () => {
    const pressed = await opened();

    expect(getComputedStyle(pressed).color).toBe('rgb(42, 91, 215)');
  });

  it('takes a dark blue background in the dark theme', async () => {
    inDarkTheme();
    const pressed = await opened();

    expect(getComputedStyle(pressed).backgroundColor).toBe('rgb(44, 60, 94)');
  });
});

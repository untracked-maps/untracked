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
});

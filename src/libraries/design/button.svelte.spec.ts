import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Button from './button.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<span>Dismiss</span>' }));

describe('button', () => {
  it('is named by its content', async () => {
    await render(Button, { children, onclick: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Dismiss' })).toBeVisible();
  });

  it('does its action once pressed', async () => {
    const presses: string[] = [];
    await render(Button, {
      children,
      onclick: (): void => {
        presses.push('pressed');
      }
    });

    await page.getByRole('button', { name: 'Dismiss' }).click();

    expect(presses).toEqual(['pressed']);
  });
});

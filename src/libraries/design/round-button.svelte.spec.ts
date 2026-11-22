import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import RoundButton from './round-button.svelte';

const children = createRawSnippet(() => ({ render: () => '<span>×</span>' }));

describe('round button', () => {
  it('is named by its label', async () => {
    await render(RoundButton, { label: 'Close', children });

    await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('is a disc of 32 px', async () => {
    await render(RoundButton, { label: 'Close', children });

    expect(page.getByRole('button', { name: 'Close' }).element().getBoundingClientRect().height).toBe(32);
  });
});

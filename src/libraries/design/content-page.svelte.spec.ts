import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ContentPage from './content-page.svelte';

describe('content page', () => {
  it('shows its content', async () => {
    await render(ContentPage, { children: createRawSnippet(() => ({ render: (): string => '<h1>Who sees what</h1>' })) });

    await expect.element(page.getByRole('heading', { name: 'Who sees what' })).toBeVisible();
  });
});

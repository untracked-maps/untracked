import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import NotFound from './not-found.svelte';

describe('not found page', () => {
  it('says that the page does not exist', async () => {
    await render(NotFound);

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });

  it('leads back to the home page', async () => {
    await render(NotFound);

    await expect.element(page.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/');
  });
});

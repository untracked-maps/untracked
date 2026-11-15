import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Welcome from './welcome.svelte';

describe('welcome page', () => {
  it('greets the world in the base locale', async () => {
    await render(Welcome);

    await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World!');
  });
});

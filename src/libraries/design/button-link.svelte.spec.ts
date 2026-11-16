import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ButtonLink from './button-link.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<span>Read it in French</span>' }));

describe('button link', () => {
  it('leads to its address', async () => {
    await render(ButtonLink, { children, href: '/fr' });

    await expect.element(page.getByRole('link', { name: 'Read it in French' })).toHaveAttribute('href', '/fr');
  });

  it('tells the language of the page it leads to', async () => {
    await render(ButtonLink, { children, href: '/fr', hreflang: 'fr' });

    await expect.element(page.getByRole('link', { name: 'Read it in French' })).toHaveAttribute('hreflang', 'fr');
  });

  it('lets the router follow it by default', async () => {
    await render(ButtonLink, { children, href: '/fr' });

    await expect.element(page.getByRole('link', { name: 'Read it in French' })).toHaveAttribute('data-sveltekit-reload', 'off');
  });

  it('reloads the whole page when asked', async () => {
    await render(ButtonLink, { children, href: '/fr', reload: true });

    await expect.element(page.getByRole('link', { name: 'Read it in French' })).toHaveAttribute('data-sveltekit-reload', '');
  });
});

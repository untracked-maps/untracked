import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import AppFrame from './app-frame.svelte';

const text = (content: string): ReturnType<typeof createRawSnippet> =>
  createRawSnippet(() => ({ render: (): string => `<p>${content}</p>` }));

const props = { top: text('Top'), children: text('Content'), bottom: text('Bottom') };

describe('app frame', () => {
  it('shows the top of the frame', async () => {
    await render(AppFrame, props);

    await expect.element(page.getByText('Top')).toBeVisible();
  });

  it('puts the content in the main landmark', async () => {
    await render(AppFrame, props);

    await expect.element(page.getByRole('main')).toHaveTextContent('Content');
  });

  it('puts the bottom in the footer landmark', async () => {
    await render(AppFrame, props);

    await expect.element(page.getByRole('contentinfo')).toHaveTextContent('Bottom');
  });
});

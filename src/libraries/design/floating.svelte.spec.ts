import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Floating from './floating.svelte';

const children = createRawSnippet(() => ({ render: (): string => '<p>Over the map</p>' }));

describe('floating', () => {
  it('shows its content', async () => {
    await render(Floating, { children });

    await expect.element(page.getByText('Over the map')).toBeVisible();
  });

  it('rounds its corners like the other cards over the map', async () => {
    await render(Floating, { children });

    expect(page.getByText('Over the map').element().parentElement).toHaveStyle({ borderRadius: '16px' });
  });

  it('sits on the surface colour by default', async () => {
    await render(Floating, { children });

    await expect.element(page.getByText('Over the map')).toHaveStyle({ color: 'rgb(28, 29, 31)' });
  });

  it('sits on the inverse surface when asked', async () => {
    await render(Floating, { children, tone: 'inverse' });

    await expect.element(page.getByText('Over the map')).toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });
});

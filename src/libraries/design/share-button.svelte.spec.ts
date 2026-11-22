import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ShareButton from './share-button.svelte';

describe('share button', () => {
  it('is named by its label', async () => {
    await render(ShareButton, { label: 'Share', onclick: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  it('does its action once pressed', async () => {
    const presses: string[] = [];
    await render(ShareButton, {
      label: 'Share',
      onclick: (): void => {
        presses.push('pressed');
      }
    });

    await page.getByRole('button', { name: 'Share' }).click();

    expect(presses).toEqual(['pressed']);
  });

  it('is a round button of 32 px', async () => {
    await render(ShareButton, { label: 'Share', onclick: () => undefined });

    expect(page.getByRole('button', { name: 'Share' }).element().getBoundingClientRect().width).toBe(32);
  });
});

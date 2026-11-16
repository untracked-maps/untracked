import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import CloseButton from './close-button.svelte';

describe('close button', () => {
  it('is named by its label', async () => {
    await render(CloseButton, { label: 'Close the card', onclick: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Close the card' })).toBeVisible();
  });

  it('does its action once pressed', async () => {
    const presses: string[] = [];
    const onclick = (): void => {
      presses.push('pressed');
    };
    await render(CloseButton, { label: 'Close the card', onclick });

    await page.getByRole('button', { name: 'Close the card' }).click();

    expect(presses).toEqual(['pressed']);
  });

  it('closes the element it controls', async () => {
    await render(CloseButton, { label: 'Close', closes: 'about' });

    await expect.element(page.getByRole('button', { name: 'Close' })).toHaveAttribute('command', 'close');
  });

  it('names the element it closes', async () => {
    await render(CloseButton, { label: 'Close', closes: 'about' });

    await expect.element(page.getByRole('button', { name: 'Close' })).toHaveAttribute('commandfor', 'about');
  });

  it('sends no command when it acts by itself', async () => {
    await render(CloseButton, { label: 'Close', onclick: () => undefined });

    await expect.element(page.getByRole('button', { name: 'Close' })).not.toHaveAttribute('command');
  });
});

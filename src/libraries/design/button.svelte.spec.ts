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

  it('stands out softly by default', async () => {
    await render(Button, { children, onclick: () => undefined });

    await expect.element(page.getByRole('button')).toHaveStyle({ backgroundColor: 'rgb(245, 248, 255)' });
  });

  it('stands out strongly when it is the main action', async () => {
    await render(Button, { children, onclick: () => undefined, tone: 'strong' });

    await expect.element(page.getByRole('button')).toHaveStyle({ backgroundColor: 'rgb(42, 91, 215)' });
  });
});

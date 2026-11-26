import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import DialogButton from './dialog-button.svelte';

const explanation = createRawSnippet(() => ({ render: (): string => '<p>Checked on the spot.</p>' }));

const drawing = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"><circle r="1"></circle></svg>' }));

const shown = async (trigger?: 'round' | 'inline'): Promise<void> => {
  await render(DialogButton, {
    label: 'What does verified mean?',
    title: 'Verified info',
    closeLabel: 'Close',
    icon: drawing,
    children: explanation,
    ...(trigger === undefined ? {} : { trigger })
  });
};

const button = (): Element | null => page.getByRole('button', { name: 'What does verified mean?' }).query();

const sizeOf = (element: Element | null): readonly number[] => {
  const box = element?.getBoundingClientRect();
  return box === undefined ? [] : [box.width, box.height];
};

describe('an inline dialog button', () => {
  it('opens its dialog', async () => {
    await shown('inline');
    await page.getByRole('button', { name: 'What does verified mean?' }).click();

    await expect.element(page.getByRole('dialog', { name: 'Verified info' })).toBeVisible();
  });

  it('is 22 pixels wide and high', async () => {
    await shown('inline');

    expect(sizeOf(button())).toEqual([22, 22]);
  });

  it('is touched from 11 pixels around it', async () => {
    await shown('inline');

    expect(getComputedStyle(button() ?? document.body, '::after').inset).toBe('-11px');
  });

  it('stays a round button by default', async () => {
    await shown();

    expect(sizeOf(button())).toEqual([48, 48]);
  });

  it('is a round button when asked', async () => {
    await shown('round');

    expect(sizeOf(button())).toEqual([48, 48]);
  });
});

import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Checkbox from './checkbox.svelte';

const props = { label: 'Transit lines', checked: false, onToggle: (): void => undefined };

describe('checkbox', () => {
  it('is named by its label', async () => {
    await render(Checkbox, props);

    await expect.element(page.getByRole('checkbox', { name: 'Transit lines' })).toBeVisible();
  });

  it('is checked when asked to', async () => {
    await render(Checkbox, { ...props, checked: true });

    await expect.element(page.getByRole('checkbox')).toBeChecked();
  });

  it('is described by its hint', async () => {
    await render(Checkbox, { ...props, hint: 'Île-de-France only' });

    await expect.element(page.getByRole('checkbox')).toHaveAccessibleDescription('Île-de-France only');
  });

  it('has no description without a hint', async () => {
    await render(Checkbox, props);

    await expect.element(page.getByRole('checkbox')).not.toHaveAttribute('aria-describedby');
  });

  it('tells when the visitor checks it', async () => {
    const toggles: boolean[] = [];
    await render(Checkbox, {
      ...props,
      onToggle: (checked: boolean): void => {
        toggles.push(checked);
      }
    });

    await page.getByRole('checkbox').click();

    expect(toggles).toEqual([true]);
  });

  it('shows no hint without one', async () => {
    const { container } = await render(Checkbox, props);

    expect(container.querySelector('small')).toBeNull();
  });
});

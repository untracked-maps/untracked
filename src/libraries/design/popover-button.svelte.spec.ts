import { Subject } from 'rxjs';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import PopoverButton from './popover-button.svelte';

const icon = createRawSnippet(() => ({ render: (): string => '<svg aria-hidden="true"></svg>' }));

const children = createRawSnippet(() => ({ render: (): string => '<p>Theme</p>' }));

const props = { label: 'Map type', icon, children };

const open = async (): Promise<void> => {
  await render(PopoverButton, props);
  await page.getByRole('button', { name: 'Map type' }).click();
};

type Wired = {
  readonly heard: boolean[];
  readonly closings: Subject<void>;
};

const wired = async (): Promise<Wired> => {
  const wires: Wired = { heard: [], closings: new Subject() };
  const onToggle = (opened: boolean): void => {
    wires.heard.push(opened);
  };
  await render(PopoverButton, { ...props, closable: { onToggle, closings: wires.closings } });
  return wires;
};

const press = (): void => document.querySelector<HTMLButtonElement>('button[aria-label="Map type"]')?.click();

describe('popover button', () => {
  it('keeps its panel closed at first', async () => {
    await render(PopoverButton, props);

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });

  it('opens a panel named by its label once pressed', async () => {
    await open();

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).toBeVisible();
  });

  it('shows its content in the panel', async () => {
    await open();

    await expect.element(page.getByRole('dialog').getByText('Theme')).toBeVisible();
  });

  it('closes its panel with the Escape key', async () => {
    await open();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });
});

describe('popover button, for what closes it from outside', () => {
  it('tells at once when its panel opens, before the next key is pressed', async () => {
    const { heard } = await wired();

    press();

    expect(heard).toEqual([true]);
  });

  it('tells when its panel closes', async () => {
    const { heard } = await wired();
    press();

    await userEvent.keyboard('{Escape}');

    await expect.poll(() => heard).toEqual([true, false]);
  });

  it('closes its panel when asked to', async () => {
    const { closings } = await wired();
    press();

    closings.next();

    await expect.element(page.getByRole('dialog', { name: 'Map type' })).not.toBeInTheDocument();
  });
});
